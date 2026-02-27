import { useState, useRef, useCallback, useEffect, type FC } from 'react';
import gsap from 'gsap';
import type { DesignLibrary } from '@/types/canvas';
import { useSpeechToText } from '@/hooks/useSpeechToText';

/* ─── Inspirational quotes (shown when panel is empty) ── */
const INSPIRATION_QUOTES = [
  { text: 'I begin with an idea and then it becomes something else.', author: 'Pablo Picasso' },
  { text: 'The most courageous act is still to think for yourself.', author: 'Coco Chanel' },
  { text: 'I invent nothing. I rediscover.', author: 'Augusta Ada King' },
  { text: 'Ideas are easy. Implementation is hard.', author: 'Guy Kawasaki' },
  { text: 'Ideas shape the course of history.', author: 'John Maynard Keynes' },
  { text: 'You can\u2019t use up creativity. The more you use, the more you have.', author: 'Maya Angelou' },
  { text: 'Creativity is intelligence having fun.', author: 'Albert Einstein' },
  { text: 'The creative adult is the child who survived.', author: 'Ursula K. Le Guin' },
  { text: 'You can\u2019t wait for inspiration. You have to go after it.', author: 'Jack London' },
  { text: 'I am my own experiment.', author: 'Frida Kahlo' },
];

/* ─── LLM model definitions ────────────────────────────── */
export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export const AVAILABLE_MODELS: LLMModel[] = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', description: 'Latest & most capable' },
  { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', provider: 'Google', description: 'Fast multimodal reasoning' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Fast, high-quality open-source' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', description: 'Lightweight & fast' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'Best-in-class reasoning' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral', description: 'Mixture-of-experts' },
  { id: 'gemma-2-27b', name: 'Gemma 2 27B', provider: 'Google', description: 'Strong multimodal' },
  { id: 'phi-4', name: 'Phi-4', provider: 'Microsoft', description: 'Small but capable' },
  { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba', description: 'Multilingual powerhouse' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', description: 'Code & reasoning' },
];

/* ─── Attachment ────────────────────────────────────────── */
interface ImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

/* ─── Reasoning step (shown during generation) ─────────── */
export interface ReasoningStep {
  id: string;
  label: string;
  detail?: string;
  status: 'pending' | 'active' | 'done';
}

/* ─── Generation entry ──────────────────────────────────── */
export interface GenerationEntry {
  id: string;
  prompt: string;
  model: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  result?: string;
  imageDataUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  reasoningSteps?: ReasoningStep[];
  timestamp: number;
  attachments: ImageAttachment[];
}

/* ─── Props ─────────────────────────────────────────────── */
interface PromptPanelProps {
  libraries: DesignLibrary[];
  selectedLibraryId?: string;
  onSelectedLibraryChange: (libraryId: string | undefined) => void;
  onGenerate: (prompt: string, model: string, attachments: ImageAttachment[], libraryId?: string) => void;
  onImageToCanvas: (attachment: ImageAttachment) => void;
  isGenerating: boolean;
  generations: GenerationEntry[];
  selectedObjectCount?: number;
}

export const PromptPanel: FC<PromptPanelProps> = ({
  libraries,
  selectedLibraryId,
  onSelectedLibraryChange,
  onGenerate,
  onImageToCanvas,
  isGenerating,
  generations,
  selectedObjectCount = 0,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const selectedLibrary = selectedLibraryId;
  const setSelectedLibrary = onSelectedLibraryChange;
  const [showLibPicker, setShowLibPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Inspirational quote cycling (GSAP pollination) ── */
  const [quoteIndex, setQuoteIndex] = useState(0);
  const showQuotes = generations.length === 0;
  const quoteOrder = useRef<number[]>([]);
  const quoteRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const authorRef = useRef<HTMLSpanElement>(null);
  const pollenRef = useRef<HTMLDivElement>(null);
  const initialReveal = useRef(true);

  // Build a shuffled order: Picasso (0) first, rest randomized
  if (quoteOrder.current.length === 0) {
    const rest = Array.from({ length: INSPIRATION_QUOTES.length - 1 }, (_, i) => i + 1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    quoteOrder.current = [0, ...rest];
  }

  // Animate pollen particles floating in
  const spawnPollen = useCallback(() => {
    if (!pollenRef.current) return;
    const container = pollenRef.current;
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'pp-pollen-particle';
      const size = 3 + Math.random() * 4;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${10 + Math.random() * 80}%`;
      dot.style.top = `${20 + Math.random() * 60}%`;
      container.appendChild(dot);
      gsap.fromTo(dot,
        { opacity: 0, scale: 0, x: (Math.random() - 0.5) * 40, y: 20 + Math.random() * 20 },
        {
          opacity: 0.25 + Math.random() * 0.35,
          scale: 1,
          x: (Math.random() - 0.5) * 60,
          y: -30 - Math.random() * 40,
          duration: 2.5 + Math.random() * 2,
          delay: Math.random() * 1.2,
          ease: 'power1.out',
          onComplete: () => dot.remove(),
        },
      );
    }
  }, []);

  // Initial reveal animation
  useEffect(() => {
    if (!showQuotes || !initialReveal.current) return;
    initialReveal.current = false;
    const tl = gsap.timeline();
    if (textRef.current) {
      tl.fromTo(textRef.current,
        { opacity: 0, y: 24, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' },
        0,
      );
    }
    if (authorRef.current) {
      tl.fromTo(authorRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        0.5,
      );
    }
    spawnPollen();
  }, [showQuotes, spawnPollen]);

  // Cycling transition with GSAP
  useEffect(() => {
    if (!showQuotes) return;
    const interval = setInterval(() => {
      // Drift out like pollen carried away
      const tl = gsap.timeline({
        onComplete: () => {
          setQuoteIndex((i) => (i + 1) % quoteOrder.current.length);
        },
      });
      if (textRef.current) {
        tl.to(textRef.current, {
          opacity: 0, y: -18, scale: 0.96,
          duration: 0.7, ease: 'power2.inOut',
        }, 0);
      }
      if (authorRef.current) {
        tl.to(authorRef.current, {
          opacity: 0, y: -10,
          duration: 0.5, ease: 'power2.in',
        }, 0.1);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [showQuotes]);

  // Animate in after quote index changes (skip initial)
  useEffect(() => {
    if (!showQuotes || !textRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(textRef.current,
      { opacity: 0, y: 20, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' },
      0,
    );
    if (authorRef.current) {
      tl.fromTo(authorRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0.25,
      );
    }
    spawnPollen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteIndex]);

  /* ── Speech-to-text (Web Speech API + Whisper fallback) ── */
  const handleSpeechTranscript = useCallback((text: string) => {
    setPrompt((prev) => {
      const needsSpace = prev.length > 0 && !prev.endsWith(' ');
      return prev + (needsSpace ? ' ' : '') + text;
    });
    textareaRef.current?.focus();
  }, []);

  const {
    isListening,
    interimTranscript,
    toggleListening,
    error: speechError,
    backend: speechBackend,
    whisperStatus,
    modelProgress,
    testMic,
    isTesting,
  } = useSpeechToText(handleSpeechTranscript);

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) ?? AVAILABLE_MODELS[0];

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() && attachments.length === 0) return;
    onGenerate(prompt.trim(), selectedModel, attachments, selectedLibrary);
    setPrompt('');
    setAttachments([]);
  }, [prompt, selectedModel, attachments, selectedLibrary, onGenerate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const img = new Image();
          img.onload = () => {
            setAttachments((prev) => [
              ...prev,
              {
                id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: file.name,
                dataUrl,
                width: img.width,
                height: img.height,
              },
            ]);
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
      // reset so same file can be re-picked
      e.target.value = '';
    },
    [],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <div className="pp">
      {/* ── Top bar: design system selector ──────────── */}
      <div className="pp-top-bar">
        <div className="pp-lib-bar">
          <button className="pp-lib-btn" onClick={() => setShowLibPicker((v) => !v)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            {selectedLibrary ? libraries.find((l) => l.id === selectedLibrary)?.name : 'None (freeform)'}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="pp-chevron">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showLibPicker && (
            <div className="pp-model-dropdown">
              <button
                className={`pp-model-option ${!selectedLibrary ? 'pp-model-option--active' : ''}`}
                onClick={() => { setSelectedLibrary(undefined); setShowLibPicker(false); }}
              >
                <span className="pp-model-option-name">None (freeform)</span>
                <span className="pp-model-option-desc">Generate without a design system</span>
              </button>
              {libraries.map((lib) => (
                <button
                  key={lib.id}
                  className={`pp-model-option ${lib.id === selectedLibrary ? 'pp-model-option--active' : ''}`}
                  onClick={() => { setSelectedLibrary(lib.id); setShowLibPicker(false); }}
                >
                  <span className="pp-model-option-name">{lib.name}</span>
                  <span className="pp-model-option-desc">{lib.components.length} components</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Selected object context ───────────────────── */}
      {selectedObjectCount > 0 && (
        <div className="pp-context-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <span>{selectedObjectCount} selected — describe changes to apply</span>
        </div>
      )}

      {/* ── Inspirational quotes (empty state) ───────── */}
      {showQuotes && (
        <div className="pp-inspiration" ref={quoteRef}>
          <div className="pp-pollen-field" ref={pollenRef} />
          <div className="pp-inspiration-quote">
            <p className="pp-inspiration-text" ref={textRef}>“{INSPIRATION_QUOTES[quoteOrder.current[quoteIndex]].text}”</p>
            <span className="pp-inspiration-author" ref={authorRef}>— {INSPIRATION_QUOTES[quoteOrder.current[quoteIndex]].author}</span>
          </div>
        </div>
      )}

      {/* ── Generation history (scrollable middle area) ── */}
      {generations.length > 0 && (
        <div className="pp-history">
          <div className="pp-history-label">History</div>
          {generations.map((gen) => (
            <div key={gen.id} className={`pp-gen pp-gen--${gen.status}`}>
              <div className="pp-gen-prompt">
                {gen.attachments.length > 0 && <span className="pp-gen-badge">⊞ {gen.attachments.length}</span>}
                {gen.prompt || '(image reference)'}
              </div>
              <div className="pp-gen-meta">
                <span className="pp-gen-model">{AVAILABLE_MODELS.find((m) => m.id === gen.model)?.name ?? gen.model}</span>
                <span className="pp-gen-status">
                  {gen.status === 'generating' && (
                    <><span className="pp-spinner pp-spinner--sm" /> Generating…</>
                  )}
                  {gen.status === 'done' && '✓ Done'}
                  {gen.status === 'error' && '✗ Error'}
                </span>
              </div>

              {/* ── Reasoning steps ── */}
              {gen.reasoningSteps && gen.reasoningSteps.length > 0 && (
                <div className="pp-reasoning">
                  {gen.reasoningSteps.map((step) => (
                    <div key={step.id} className={`pp-reasoning-step pp-reasoning-step--${step.status}`}>
                      <span className="pp-reasoning-icon">
                        {step.status === 'done' && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5 8.5L7 10.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {step.status === 'active' && (
                          <span className="pp-reasoning-pulse" />
                        )}
                        {step.status === 'pending' && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                          </svg>
                        )}
                      </span>
                      <span className="pp-reasoning-label">{step.label}</span>
                      {step.detail && <span className="pp-reasoning-detail">{step.detail}</span>}
                    </div>
                  ))}
                </div>
              )}

              {gen.status === 'error' && gen.result && (
                <div className="pp-gen-error">{gen.result}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Attachments preview ────────────────────────── */}
      {attachments.length > 0 && (
        <div className="pp-attachments">
          {attachments.map((att) => (
            <div key={att.id} className="pp-att">
              <img src={att.dataUrl} alt={att.name} className="pp-att-img" />
              <div className="pp-att-info">
                <span className="pp-att-name">{att.name}</span>
                <div className="pp-att-actions">
                  <button className="pp-att-action" onClick={() => onImageToCanvas(att)} title="Add to canvas">
                    →
                  </button>
                  <button className="pp-att-action" onClick={() => removeAttachment(att.id)} title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom input area ──────────────────────────── */}
      <div className="pp-input-area">
        {/* Model dropdown (opens upward) */}
        {showModelPicker && (
          <div className="pp-model-dropdown pp-model-dropdown--up">
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.id}
                className={`pp-model-option ${m.id === selectedModel ? 'pp-model-option--active' : ''}`}
                onClick={() => {
                  setSelectedModel(m.id);
                  setShowModelPicker(false);
                }}
              >
                <span className="pp-model-option-name">{m.name}</span>
                <span className="pp-model-option-desc">{m.description}</span>
              </button>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="pp-textarea"
          placeholder={isListening ? 'Listening… speak now' : 'Describe your idea...'}
          value={prompt + (interimTranscript ? (prompt ? ' ' : '') + interimTranscript : '')}
          onChange={(e) => {
            const raw = e.target.value;
            // Strip interim transcript suffix so it doesn't get baked into state
            if (interimTranscript) {
              const suffix = (prompt ? ' ' : '') + interimTranscript;
              if (raw.endsWith(suffix)) {
                setPrompt(raw.slice(0, raw.length - suffix.length));
                return;
              }
            }
            setPrompt(raw);
          }}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        {/* Speech status — progress bar, error, backend badge */}
        {(speechError || whisperStatus === 'loading-model' || isListening) && (
          <div className="pp-speech-tip">
            {whisperStatus === 'loading-model' && (
              <div className="pp-model-progress">
                <div className="pp-model-progress-bar" style={{ width: `${modelProgress}%` }} />
              </div>
            )}
            {speechError && <span>{speechError}</span>}
            {isListening && speechBackend && (
              <span className="pp-speech-badge">{speechBackend === 'native' ? 'Live' : 'Whisper'}</span>
            )}
          </div>
        )}
        <div className="pp-input-actions">
          <button
            className="pp-model-chip"
            onClick={() => setShowModelPicker((v) => !v)}
            title="Choose model"
          >
            <span className="pp-model-chip-name">{currentModel.name}</span>
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" className="pp-chevron">
              <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="pp-input-right">
            <button
              className={`pp-icon-btn ${isListening ? 'pp-icon-btn--active' : ''}`}
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Voice input (speech-to-text)'}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
              aria-pressed={isListening}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              {isListening && <span className="pp-mic-pulse" />}
            </button>
            <button
              className={`pp-icon-btn ${isTesting ? 'pp-icon-btn--testing' : ''}`}
              onClick={() => testMic()}
              disabled={isListening || isTesting}
              title="Test microphone"
              aria-label="Test microphone"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </button>
            <button className="pp-icon-btn" onClick={handleFileSelect} title="Attach image as reference">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <button
              className="pp-send-btn"
              onClick={handleSubmit}
              disabled={isGenerating || (!prompt.trim() && attachments.length === 0)}
              title="Generate (Enter)"
            >
              {isGenerating ? (
                <span className="pp-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export type { ImageAttachment };
