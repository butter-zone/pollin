import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageReference, useCanvasReferences as _useCanvasReferences } from '@/hooks/useCanvasReferences';

interface ReferencePanelProps {
  onAddReference: (file: File, x: number, y: number) => Promise<void>;
  references: ImageReference[];
  onRemoveReference: (id: string) => void;
  onUpdateReference: (id: string, updates: Partial<ImageReference>) => void;
  onMoveReference: (id: string, x: number, y: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export function ReferencePanel({
  onAddReference,
  references,
  onRemoveReference,
  onUpdateReference,
  onMoveReference,
  canvasWidth,
  canvasHeight,
}: ReferencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedRef, setDraggedRef] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const rect = (e.currentTarget as HTMLCanvasElement)?.getBoundingClientRect?.();
        const x = rect ? e.clientX - rect.left : canvasWidth / 2;
        const y = rect ? e.clientY - rect.top : canvasHeight / 2;
        onAddReference(file, x, y);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          await onAddReference(file, canvasWidth / 2, canvasHeight / 2);
        } catch (error) {
          console.error('Failed to add reference:', error);
        }
      }
    }

    e.currentTarget.value = '';
  };

  const handleRefMouseDown = (e: React.MouseEvent, refId: string) => {
    e.preventDefault();
    setDraggedRef(refId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedRef && references.length > 0) {
      const ref = references.find((r) => r.id === draggedRef);
      if (ref) {
        const deltaX = e.movementX || 0;
        const deltaY = e.movementY || 0;
        onMoveReference(draggedRef, ref.x + deltaX, ref.y + deltaY);
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedRef(null);
  };

  useEffect(() => {
    if (draggedRef) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedRef, references, onMoveReference]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-surface-700 pt-lg space-y-lg"
      role="region"
      aria-label="Reference images panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-surface-200">References ({references.length})</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="control-button px-sm py-xs text-xs"
          aria-expanded={isExpanded}
          aria-label="Toggle reference panel"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-sm"
        >
          {/* Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-surface-600 rounded p-md text-center cursor-pointer hover:border-surface-500 transition-colors"
            role="button"
            tabIndex={0}
            aria-label="Drop images here to add references"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload image files"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-surface-300 hover:text-surface-200"
            >
              📁 Click to upload or drag images here
            </button>
          </div>

          {/* Reference List */}
          {references.length > 0 ? (
            <div className="space-y-xs max-h-60 overflow-y-auto">
              <AnimatePresence>
                {references.map((ref) => (
                  <ReferenceItem
                    key={ref.id}
                    reference={ref}
                    onRemove={() => onRemoveReference(ref.id)}
                    onUpdate={(updates) => onUpdateReference(ref.id, updates)}
                    onMouseDown={(e) => handleRefMouseDown(e, ref.id)}
                    isDragging={draggedRef === ref.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-xs text-surface-400 text-center py-md">
              No references yet. Add images to start mood boarding.
            </p>
          )}

          {/* Clear All */}
          {references.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Delete all references?')) {
                  references.forEach((ref) => onRemoveReference(ref.id));
                }
              }}
              className="control-button w-full py-md text-sm bg-red-900 hover:bg-red-800"
              aria-label="Delete all references"
            >
              🗑️ Clear All References
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface ReferenceItemProps {
  reference: ImageReference;
  onRemove: () => void;
  onUpdate: (updates: Partial<ImageReference>) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

function ReferenceItem({
  reference,
  onRemove,
  onUpdate,
  onMouseDown,
  isDragging,
}: ReferenceItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-surface-700 p-sm rounded flex gap-sm items-start ${
        isDragging ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* Thumbnail */}
      <img
        src={reference.src}
        alt="Reference"
        className="w-12 h-12 object-cover rounded flex-shrink-0 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        draggable={false}
      />

      {/* Controls */}
      <div className="flex-1 min-w-0 space-y-xs">
        <div className="text-xs font-mono text-surface-300 truncate">{reference.id}</div>

        {/* Opacity Control */}
        <div>
          <label className="text-xs text-surface-400">Opacity: {Math.round(reference.opacity * 100)}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(reference.opacity * 100)}
            onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) / 100 })}
            className="w-full h-1 bg-surface-600 rounded"
            aria-label="Opacity control"
          />
        </div>

        {/* Rotation Control */}
        <div>
          <label className="text-xs text-surface-400">Rotation: {Math.round(reference.rotation)}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={reference.rotation}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="w-full h-1 bg-surface-600 rounded"
            aria-label="Rotation control"
          />
        </div>

        {/* Size Info */}
        <div className="text-xs text-surface-400">
          {Math.round(reference.width)} × {Math.round(reference.height)}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={onRemove}
        className="control-button px-sm py-xs text-xs bg-red-900 hover:bg-red-800 flex-shrink-0"
        aria-label={`Delete reference ${reference.id}`}
      >
        ✕
      </button>
    </motion.div>
  );
}
