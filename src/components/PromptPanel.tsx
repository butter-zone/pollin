import { useState, useRef, useCallback, type FC } from 'react';
import type { DesignLibrary } from '@/types/canvas';
import { useSpeechToText } from '@/hooks/useSpeechToText';

/* ─── LLM model definitions ────────────────────────────── */
export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export const AVAILABLE_MODELS: LLMModel[] = [
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

              {gen.status === 'done' && gen.imageDataUrl && (
                <div className="pp-gen-preview">
                  <img
                    src={gen.imageDataUrl}
                    alt={`Generated: ${gen.prompt}`}
                    className="pp-gen-preview-img"
                  />
                  <div className="pp-gen-preview-badge">Generated UI</div>
                </div>
              )}
              {gen.status === 'done' && !gen.imageDataUrl && gen.result && (
                <pre className="pp-gen-code">{gen.result}</pre>
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
        {/* Speech status / error */}
        {speechError && (
          <div className="pp-speech-tip">
            <span>{speechError}</span>
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
