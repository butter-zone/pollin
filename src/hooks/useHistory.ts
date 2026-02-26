import { useCallback, useRef } from 'react';
import type { CanvasObject } from '@/types/canvas';

/**
 * Manages an undo/redo history stack for canvas objects.
 * Snapshots are stored as full object arrays (simple & reliable).
 *
 * Transaction support: call `beginTransaction()` before a multi-step
 * gesture (e.g. drag). The first `pushSnapshot()` inside the transaction
 * records state; subsequent calls are no-ops. Call `endTransaction()`
 * when the gesture finishes.
 */

const MAX_HISTORY = 50;

interface Snapshot {
  objects: CanvasObject[];
  selectedIds: string[];
}

export function useHistory(
  getCurrentObjects: () => CanvasObject[],
  getCurrentSelection: () => string[],
  applySnapshot: (objects: CanvasObject[], selectedIds: string[]) => void,
) {
  const undoStack = useRef<Snapshot[]>([]);
  const redoStack = useRef<Snapshot[]>([]);
  const inTransaction = useRef(false);
  const transactionPushed = useRef(false);

  /** Start a transaction — only the first pushSnapshot inside it records state. */
  const beginTransaction = useCallback(() => {
    inTransaction.current = true;
    transactionPushed.current = false;
  }, []);

  /** End the current transaction. */
  const endTransaction = useCallback(() => {
    inTransaction.current = false;
    transactionPushed.current = false;
  }, []);

  /** Take a snapshot of current state before a mutation */
  const pushSnapshot = useCallback(() => {
    // Inside a transaction, only push once (at gesture start)
    if (inTransaction.current) {
      if (transactionPushed.current) return;
      transactionPushed.current = true;
    }

    undoStack.current.push({
      objects: getCurrentObjects(),
      selectedIds: getCurrentSelection(),
    });
    // Cap the stack size
    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift();
    }
    // Any new mutation clears the redo stack
    redoStack.current = [];
  }, [getCurrentObjects, getCurrentSelection]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    // Save current state to redo
    redoStack.current.push({
      objects: getCurrentObjects(),
      selectedIds: getCurrentSelection(),
    });
    const snapshot = undoStack.current.pop()!;
    applySnapshot(snapshot.objects, snapshot.selectedIds);
  }, [getCurrentObjects, getCurrentSelection, applySnapshot]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    // Save current state to undo
    undoStack.current.push({
      objects: getCurrentObjects(),
      selectedIds: getCurrentSelection(),
    });
    const snapshot = redoStack.current.pop()!;
    applySnapshot(snapshot.objects, snapshot.selectedIds);
  }, [getCurrentObjects, getCurrentSelection, applySnapshot]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  return { pushSnapshot, undo, redo, canUndo, canRedo, beginTransaction, endTransaction };
}
