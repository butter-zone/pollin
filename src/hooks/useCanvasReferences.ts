import { useCallback, useState } from 'react';

export interface ImageReference {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  timestamp: Date;
}

export interface UseCanvasReferencesReturn {
  references: ImageReference[];
  addReference: (file: File, x: number, y: number) => Promise<void>;
  removeReference: (id: string) => void;
  updateReference: (id: string, updates: Partial<ImageReference>) => void;
  moveReference: (id: string, x: number, y: number) => void;
  scaleReference: (id: string, width: number, height: number) => void;
  rotateReference: (id: string, rotation: number) => void;
  setReferenceOpacity: (id: string, opacity: number) => void;
  clearAllReferences: () => void;
  getReference: (id: string) => ImageReference | undefined;
}

export function useCanvasReferences(): UseCanvasReferencesReturn {
  const [references, setReferences] = useState<ImageReference[]>([]);

  const addReference = useCallback(async (file: File, x: number, y: number) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          const newRef: ImageReference = {
            id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src,
            x,
            y,
            width: Math.min(300, img.width),
            height: Math.min(300, img.height),
            rotation: 0,
            opacity: 1,
            timestamp: new Date(),
          };

          setReferences((prev) => [...prev, newRef]);
          resolve();
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = src;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  const removeReference = useCallback((id: string) => {
    setReferences((prev) => prev.filter((ref) => ref.id !== id));
  }, []);

  const updateReference = useCallback((id: string, updates: Partial<ImageReference>) => {
    setReferences((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, ...updates } : ref))
    );
  }, []);

  const moveReference = useCallback((id: string, x: number, y: number) => {
    updateReference(id, { x, y });
  }, [updateReference]);

  const scaleReference = useCallback((id: string, width: number, height: number) => {
    updateReference(id, { width, height });
  }, [updateReference]);

  const rotateReference = useCallback((id: string, rotation: number) => {
    updateReference(id, { rotation: rotation % 360 });
  }, [updateReference]);

  const setReferenceOpacity = useCallback((id: string, opacity: number) => {
    updateReference(id, { opacity: Math.max(0, Math.min(1, opacity)) });
  }, [updateReference]);

  const clearAllReferences = useCallback(() => {
    setReferences([]);
  }, []);

  const getReference = useCallback(
    (id: string) => {
      return references.find((ref) => ref.id === id);
    },
    [references]
  );

  return {
    references,
    addReference,
    removeReference,
    updateReference,
    moveReference,
    scaleReference,
    rotateReference,
    setReferenceOpacity,
    clearAllReferences,
    getReference,
  };
}
