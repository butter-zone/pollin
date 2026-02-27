/**
 * Browser-based Whisper speech-to-text fallback.
 *
 * Uses @huggingface/transformers to run Whisper-tiny entirely
 * in the browser (WebGPU → WASM fallback). The model (~40 MB) is
 * cached in the browser after the first download.
 *
 * Flow: record audio via MediaRecorder → decode to 16 kHz mono
 * Float32Array → run through Whisper pipeline → return text.
 */

import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

/* ─── Types ─────────────────────────────────────────────── */

export type WhisperStatus =
  | 'idle'
  | 'loading-model'
  | 'model-ready'
  | 'recording'
  | 'transcribing'
  | 'error';

export interface WhisperProgress {
  status: WhisperStatus;
  /** 0-100 model download / load progress */
  progress: number;
  message: string;
}

type ProgressCallback = (p: WhisperProgress) => void;

/* ─── Singleton ─────────────────────────────────────────── */

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let loadingPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

async function getTranscriber(
  onProgress?: ProgressCallback,
): Promise<AutomaticSpeechRecognitionPipeline> {
  if (transcriber) return transcriber;
  if (loadingPromise) return loadingPromise;

  onProgress?.({
    status: 'loading-model',
    progress: 0,
    message: 'Downloading speech model…',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadingPromise = (pipeline as any)(
    'automatic-speech-recognition',
    'onnx-community/whisper-tiny.en',
    {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (p: { progress?: number; status?: string }) => {
        const pct = typeof p.progress === 'number' ? Math.round(p.progress) : 0;
        onProgress?.({
          status: 'loading-model',
          progress: pct,
          message:
            p.status === 'ready'
              ? 'Speech model ready'
              : `Downloading speech model\u2026 ${pct}%`,
        });
      },
    },
  ) as Promise<AutomaticSpeechRecognitionPipeline>;

  try {
    transcriber = await loadingPromise;
  } catch (err) {
    loadingPromise = null;
    throw new Error(
      `Failed to load speech model: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  loadingPromise = null;

  onProgress?.({
    status: 'model-ready',
    progress: 100,
    message: 'Speech model ready',
  });

  return transcriber;
}

/* ─── Audio helpers ─────────────────────────────────────── */

/**
 * Decode an audio Blob to a 16 kHz mono Float32Array.
 *
 * Uses a real AudioContext for the initial decode (much better codec
 * support than OfflineAudioContext), then OfflineAudioContext to
 * resample to the 16 kHz mono that Whisper expects.
 */
async function blobToFloat32(blob: Blob): Promise<Float32Array> {
  if (blob.size < 100) {
    throw new Error('Audio recording too short — please speak for at least 1 second.');
  }

  const arrayBuf = await blob.arrayBuffer();

  // Step 1: Decode using a real AudioContext — much wider codec support
  // than OfflineAudioContext (handles webm/opus, mp4/aac, ogg, etc.)
  let decoded: AudioBuffer;
  const tempCtx = new AudioContext({ sampleRate: 16_000 });
  try {
    decoded = await tempCtx.decodeAudioData(arrayBuf.slice(0));
  } catch (decodeErr) {
    // Fallback: try with default sample rate (some browsers reject forced rate)
    const fallbackCtx = new AudioContext();
    try {
      decoded = await fallbackCtx.decodeAudioData(arrayBuf.slice(0));
    } catch {
      throw new Error(
        `Could not decode audio (${blob.type || 'unknown format'}). ` +
        `Try a different browser — Chrome or Edge work best. ` +
        `Original error: ${decodeErr instanceof Error ? decodeErr.message : String(decodeErr)}`,
      );
    } finally {
      await fallbackCtx.close().catch(() => {});
    }
  } finally {
    await tempCtx.close().catch(() => {});
  }

  // Step 2: Resample to 16 kHz mono via OfflineAudioContext
  const targetLength = Math.ceil(decoded.duration * 16_000);
  if (targetLength < 1) {
    throw new Error('Audio recording too short — please speak for at least 1 second.');
  }

  const offCtx = new OfflineAudioContext(1, targetLength, 16_000);
  const src = offCtx.createBufferSource();
  src.buffer = decoded;
  src.connect(offCtx.destination);
  src.start();

  const rendered = await offCtx.startRendering();
  return rendered.getChannelData(0);
}

/**
 * Pick the best supported MIME type for MediaRecorder.
 * Tries opus-in-webm first (widest decode support), then ogg, then mp4.
 */
function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return ''; // let browser choose default
}

/* ─── Recorder class ────────────────────────────────────── */

export class WhisperRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingStartTime = 0;

  status: WhisperStatus = 'idle';

  /**
   * Ensure the model is loaded (call early to pre-warm).
   */
  async warmup(onProgress?: ProgressCallback): Promise<void> {
    await getTranscriber(onProgress);
  }

  /**
   * Quick mic permission + audio capture test.
   * Returns { ok, error?, durationMs? }.
   */
  static async testMicrophone(): Promise<{
    ok: boolean;
    error?: string;
    durationMs?: number;
  }> {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowed') || msg.includes('Permission denied')) {
        return { ok: false, error: 'Microphone access denied. Check browser permissions.' };
      }
      return { ok: false, error: `Microphone unavailable: ${msg}` };
    }

    // Record 1.5s of audio and verify we get data
    return new Promise((resolve) => {
      const mime = pickMimeType();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const start = performance.now();
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const elapsed = Math.round(performance.now() - start);
        const totalSize = chunks.reduce((s, c) => s + c.size, 0);
        if (totalSize < 100) {
          resolve({ ok: false, error: 'Mic connected but no audio data received.', durationMs: elapsed });
          return;
        }
        // Try decoding to verify the pipeline works end-to-end
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          await blobToFloat32(blob);
          resolve({ ok: true, durationMs: elapsed });
        } catch (err) {
          resolve({
            ok: false,
            error: `Mic works but audio decode failed: ${err instanceof Error ? err.message : String(err)}`,
            durationMs: elapsed,
          });
        }
      };

      recorder.start(100);
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, 1500);
    });
  }

  /**
   * Request mic access and start recording.
   */
  async startRecording(onProgress?: ProgressCallback): Promise<void> {
    // Pre-load model in parallel with mic request
    const modelPromise = getTranscriber(onProgress);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowed') || msg.includes('Permission denied')) {
        throw new Error('Microphone access denied. Please allow mic access in your browser settings.');
      }
      throw new Error(`Could not access microphone: ${msg}`);
    }

    this.chunks = [];

    const mimeType = pickMimeType();
    this.mediaRecorder = new MediaRecorder(
      this.stream,
      mimeType ? { mimeType } : undefined,
    );
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start(250); // collect chunks every 250ms
    this.recordingStartTime = Date.now();

    await modelPromise; // ensure model is ready
    this.status = 'recording';
    onProgress?.({ status: 'recording', progress: 0, message: 'Recording… click mic to stop' });
  }

  /** How long the current recording has been running (ms). */
  get recordingDuration(): number {
    if (!this.recordingStartTime || this.status !== 'recording') return 0;
    return Date.now() - this.recordingStartTime;
  }

  /**
   * Stop recording, transcribe, and return the text.
   */
  async stopAndTranscribe(onProgress?: ProgressCallback): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error('Not recording'));
        return;
      }

      const savedMime = this.mediaRecorder.mimeType;

      this.mediaRecorder.onstop = async () => {
        try {
          this.status = 'transcribing';
          onProgress?.({
            status: 'transcribing',
            progress: 0,
            message: 'Transcribing…',
          });

          const totalSize = this.chunks.reduce((s, c) => s + c.size, 0);
          if (totalSize < 100) {
            this.cleanup();
            this.status = 'idle';
            resolve(''); // No meaningful audio
            return;
          }

          const blob = new Blob(this.chunks, { type: savedMime });

          let audio: Float32Array;
          try {
            audio = await blobToFloat32(blob);
          } catch (decodeErr) {
            this.cleanup();
            this.status = 'error';
            reject(
              new Error(
                decodeErr instanceof Error
                  ? decodeErr.message
                  : 'Failed to decode audio. Try Chrome or Edge.',
              ),
            );
            return;
          }

          // Sanity check: if audio is less than ~0.3s of silence, skip
          if (audio.length < 4800) {
            this.cleanup();
            this.status = 'idle';
            resolve('');
            return;
          }

          const t = await getTranscriber();
          const result = await t(audio);

          this.cleanup();
          this.status = 'idle';

          const text = Array.isArray(result)
            ? result.map((r) => r.text).join(' ')
            : result.text;

          resolve(text.trim());
        } catch (err) {
          this.cleanup();
          this.status = 'error';
          reject(
            new Error(
              `Transcription failed: ${err instanceof Error ? err.message : String(err)}`,
            ),
          );
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /** Release mic stream resources. */
  private cleanup() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.recordingStartTime = 0;
  }

  /** Cancel any in-progress recording without transcribing. */
  cancel() {
    if (this.mediaRecorder?.state !== 'inactive') {
      try { this.mediaRecorder?.stop(); } catch { /* noop */ }
    }
    this.cleanup();
    this.status = 'idle';
  }
}
