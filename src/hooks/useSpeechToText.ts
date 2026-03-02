import { useState, useRef, useCallback, useEffect } from 'react';
import { WhisperRecorder, type WhisperStatus } from '@/services/whisper-fallback';

/* ─── Web Speech API types ──────────────────────────────── */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

/* ─── Hook ──────────────────────────────────────────────── */

export interface UseSpeechToTextReturn {
  /** Whether voice input is available (always true — Whisper fallback) */
  isSupported: boolean;
  /** Currently recording / listening */
  isListening: boolean;
  /** Interim (in-progress) transcript — only for Web Speech API */
  interimTranscript: string;
  /** Toggle listening on/off */
  toggleListening: () => void;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Last error or status message */
  error: string | null;
  /** Which backend is active: 'native' | 'whisper' | null */
  backend: 'native' | 'whisper' | null;
  /** Whisper model status for progress UI */
  whisperStatus: WhisperStatus;
  /** Whisper model download progress 0-100 */
  modelProgress: number;

}

export function useSpeechToText(
  onTranscript: (text: string) => void,
  lang = 'en-US',
): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<'native' | 'whisper' | null>(null);
  const [whisperStatus, setWhisperStatus] = useState<WhisperStatus>('idle');
  const [modelProgress, setModelProgress] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const whisperRef = useRef<WhisperRecorder | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // Track whether the user explicitly requested stop (vs browser auto-ending)
  const userStoppedRef = useRef(false);

  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;

  const hasNativeSupport = !!SpeechRecognitionCtor;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      whisperRef.current?.cancel();
    };
  }, []);

  /* ── Whisper fallback start ──────────────────────────── */
  const startWhisper = useCallback(async () => {
    setError(null);
    setBackend('whisper');

    if (!whisperRef.current) {
      whisperRef.current = new WhisperRecorder();
    }

    try {
      await whisperRef.current.startRecording((p) => {
        setWhisperStatus(p.status);
        setModelProgress(p.progress);
        if (p.status === 'loading-model') {
          setError(p.message);
        } else if (p.status === 'recording') {
          setError(null);
        }
      });
      setIsListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start recording';
      setError(msg);
      setIsListening(false);
      setBackend(null);
    }
  }, []);

  const stopWhisper = useCallback(async () => {
    if (!whisperRef.current) return;

    setIsListening(false);
    setWhisperStatus('transcribing');
    setError('Transcribing…');

    try {
      const text = await whisperRef.current.stopAndTranscribe((p) => {
        setWhisperStatus(p.status);
      });
      setError(null);
      setWhisperStatus('idle');
      setBackend(null);
      if (text) onTranscriptRef.current(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transcription failed';
      setError(msg);
      setWhisperStatus('error');
      setBackend(null);
    }
  }, []);

  /* ── Native Web Speech API start ─────────────────────── */
  const startNative = useCallback(() => {
    if (!SpeechRecognitionCtor) return;

    setError(null);
    setBackend('native');

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        onTranscriptRef.current(finalText);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      // On non-fatal errors, auto-fallback to Whisper instead of dying
      const errCode = event.error;
      if (errCode === 'not-allowed') {
        // Permission denied — Whisper also needs mic, so just report
        setError('Microphone access denied. Please allow mic access in your browser settings.');
        setIsListening(false);
        setBackend(null);
        return;
      }

      if (errCode === 'no-speech') {
        setError('No speech detected. Try again.');
        // Don't kill the session — let it keep listening
        return;
      }

      // For network, service-not-allowed, aborted, etc. → auto-fallback to Whisper
      console.warn(`[STT] Native speech error "${errCode}", falling back to Whisper`);
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setError('Switching to offline speech model…');
      startWhisper();
    };

    recognition.onend = () => {
      // Only act if this is still the active recognition instance
      if (recognitionRef.current !== recognition) return;

      // If the user explicitly stopped, clean up and exit
      if (userStoppedRef.current) {
        userStoppedRef.current = false;
        setIsListening(false);
        setInterimTranscript('');
        setBackend(null);
        return;
      }

      // Browser auto-ended (silence timeout, network hiccup, etc.)
      // Auto-restart so speech keeps streaming until the user clicks stop
      try {
        recognition.start();
      } catch {
        // If restart fails, clean up gracefully
        setIsListening(false);
        setInterimTranscript('');
        setBackend(null);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      // start() failed — fall back to Whisper
      console.warn('[STT] Native recognition.start() failed, falling back to Whisper');
      setError('Switching to offline speech model…');
      startWhisper();
    }
  }, [SpeechRecognitionCtor, lang, startWhisper]);

  /* ── Unified start / stop / toggle ───────────────────── */
  const startListening = useCallback(() => {
    if (hasNativeSupport) {
      startNative();
    } else {
      startWhisper();
    }
  }, [hasNativeSupport, startNative, startWhisper]);

  const stopListening = useCallback(() => {
    if (backend === 'whisper') {
      stopWhisper();
    } else {
      // Signal that this is a user-initiated stop so onend doesn't auto-restart
      userStoppedRef.current = true;
      recognitionRef.current?.stop();
      // State cleanup happens in the onend handler
    }
  }, [backend, stopWhisper]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported: true, // always supported thanks to Whisper fallback
    isListening,
    interimTranscript,
    toggleListening,
    startListening,
    stopListening,
    error,
    backend,
    whisperStatus,
    modelProgress,
  };
}
