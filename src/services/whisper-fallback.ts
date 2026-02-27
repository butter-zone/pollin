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

  transcriber = await loadingPromise;
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
 * Decode an audio Blob to a 16 kHz mono Float32Array
 * using OfflineAudioContext.
 */
async function blobToFloat32(blob: Blob): Promise<Float32Array> {
  const arrayBuf = await blob.arrayBuffer();
  const audioCtx = new OfflineAudioContext(1, 1, 16_000);
  const decoded = await audioCtx.decodeAudioData(arrayBuf);

  // Resample to 16 kHz mono
  const offCtx = new OfflineAudioContext(
    1,
    Math.ceil((decoded.duration * 16_000)),
    16_000,
  );
  const src = offCtx.createBufferSource();
  src.buffer = decoded;
  src.connect(offCtx.destination);
  src.start();
  const rendered = await offCtx.startRendering();
  return rendered.getChannelData(0);
}

/* ─── Recorder class ────────────────────────────────────── */

export class WhisperRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  status: WhisperStatus = 'idle';

  /**
   * Ensure the model is loaded (call early to pre-warm).
   */
  async warmup(onProgress?: ProgressCallback): Promise<void> {
    await getTranscriber(onProgress);
  }

  /**
   * Request mic access and start recording.
   */
  async startRecording(onProgress?: ProgressCallback): Promise<void> {
    // Pre-load model in parallel with mic request
    const modelPromise = getTranscriber(onProgress);

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];

    // Use a widely-supported mime type
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start(250); // collect chunks every 250ms

    await modelPromise; // ensure model is ready
    this.status = 'recording';
    onProgress?.({ status: 'recording', progress: 0, message: 'Recording… click mic to stop' });
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

      this.mediaRecorder.onstop = async () => {
        try {
          this.status = 'transcribing';
          onProgress?.({
            status: 'transcribing',
            progress: 0,
            message: 'Transcribing…',
          });

          const blob = new Blob(this.chunks, { type: this.mediaRecorder!.mimeType });
          const audio = await blobToFloat32(blob);

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
          reject(err);
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
