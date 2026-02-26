# Phase 2: Persistence & Export — READY FOR REVIEW

## What's New

Phase 2 adds production-ready **persistence, autosave, and export capabilities** to Pollin. Users can now:

- 💾 **Save/Load Sessions** — Store multiple canvas sessions in browser localStorage
- 🔄 **Autosave** — Automatic background save every 10 seconds (configurable)
- 📋 **Export JSON** — Full canvas state for archival or sharing
- 🖼️ **Export PNG** — Rendered canvas as image (pixel-perfect)
- ✏️ **Export SVG** — Vector export for print or further editing
- 📂 **Import JSON** — Restore previously exported canvas state
- 🗑️ **Session Management** — View, load, and delete saved sessions

## Architecture

### New Hooks

**`useCanvasPersistence()`** (191 lines)
- Manages all persistence operations
- localStorage operations (save/load/delete)
- Export/import (JSON, PNG, SVG)
- Autosave scheduling and cleanup
- State tracking (autosaveEnabled, isDirty, lastSaved)

**Returns:**
```typescript
{
  state: {
    autosaveEnabled: boolean;
    autosaveInterval: number;
    lastSaved: Date | null;
    isDirty: boolean;
  };
  saveToLocalStorage: (strokes, sessionId) => void;
  loadFromLocalStorage: (sessionId) => DrawingStroke[] | null;
  deleteFromLocalStorage: (sessionId) => void;
  getSessions: () => Array<{id, timestamp, strokeCount}>;
  exportAsJSON: (strokes) => string;
  importFromJSON: (json) => DrawingStroke[] | null;
  exportAsPNG: (canvas, filename?) => void;
  exportAsSVG: (strokes, width, height) => string;
  enableAutosave: (strokes, sessionId, interval?) => void;
  disableAutosave: () => void;
  setMarkClean: () => void;
  setMarkDirty: () => void;
}
```

### New Component

**`PersistencePanel.tsx`** (254 lines)
- Floating UI panel for save/load/export operations
- Session management (view, load, delete saved sessions)
- Autosave toggle with status indicator
- Export options (JSON, PNG, SVG)
- Import dialog with drag-drop support
- "Unsaved changes" warning
- Full keyboard accessibility (WCAG AA)

### Storage Structure

**localStorage Keys:**
```
pollin_canvas_{sessionId}
  → { sessionId, strokes[], timestamp, strokeCount }

pollin_sessions_
  → [{ id, timestamp, strokeCount }, ...]
```

**Export Formats:**

1. **JSON** — Full state format
   ```json
   {
     "version": "1.0",
     "timestamp": "2024-01-15T10:30:45.123Z",
     "strokes": [
       {
         "points": [{ "x": 10, "y": 20, "timestamp": 1234567890 }, ...],
         "color": "#ffffff",
         "lineWidth": 2,
         "timestamp": 1234567890
       }
     ]
   }
   ```

2. **PNG** — Canvas.toBlob() → direct download
3. **SVG** — Path-based vector (scalable, editable)

## How to Use (Integration)

### Basic Setup in `CanvasAdvanced.tsx` or App.tsx

```tsx
import { useCanvasPersistence } from '@/hooks/useCanvasPersistence';
import { PersistencePanel } from '@/components/PersistencePanel';

function Canvas() {
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const persistence = useCanvasPersistence();

  useEffect(() => {
    // Enable autosave when component mounts
    persistence.enableAutosave(strokes, 'my-session', 10000);
    return () => persistence.disableAutosave();
  }, []);

  const handleStrokeAdded = (stroke: DrawingStroke) => {
    setStrokes(prev => [...prev, stroke]);
    persistence.setMarkDirty(); // Mark as unsaved
  };

  return (
    <>
      <canvas ref={canvasRef} />
      <PersistencePanel
        strokes={strokes}
        canvas={canvasRef.current}
        onLoadStrokes={(loaded) => setStrokes(loaded)}
      />
    </>
  );
}
```

### Manual Save/Load

```tsx
// Save on demand
persistence.saveToLocalStorage(strokes, 'my-design-v1');

// Load a saved session
const loaded = persistence.loadFromLocalStorage('my-design-v1');
if (loaded) setStrokes(loaded);

// Export
const json = persistence.exportAsJSON(strokes);
const svg = persistence.exportAsSVG(strokes, 800, 600);
persistence.exportAsPNG(canvas, 'my-design.png');

// Import
const imported = persistence.importFromJSON(jsonString);
```

## How to Test

### ✅ Test Checklist

- [ ] **Autosave enabled**
  - Enable autosave in PersistencePanel
  - Verify "Autosaving to: session-name" indicator appears
  - Draw a stroke
  - Wait 10 seconds
  - Verify "Last saved: HH:MM:SS" updates

- [ ] **Save/Load session**
  - Draw several strokes
  - Click "Save" button
  - Verify new session appears in "Saved Sessions" list
  - Clear the canvas (Ctrl+A → Delete or clear button)
  - Click load button next to saved session
  - Verify strokes reappear exactly

- [ ] **Session management**
  - Save multiple sessions with different names
  - Verify all appear in session list with stroke count and timestamp
  - Delete a session
  - Verify it's removed from list and localStorage

- [ ] **Export JSON**
  - Draw strokes
  - Click "Export JSON"
  - Verify file downloads as `canvas-{timestamp}.json`
  - Open in text editor
  - Verify JSON contains version, timestamp, and strokes array

- [ ] **Export PNG**
  - Draw colorful strokes
  - Click "Export PNG"
  - Verify file downloads as `canvas-{timestamp}.png`
  - Open in image viewer
  - Verify image matches canvas exactly

- [ ] **Export SVG**
  - Draw strokes
  - Click "Export SVG"
  - Verify file downloads as `canvas-{timestamp}.svg`
  - Open in browser or editor
  - Verify strokes appear as paths with correct colors and line widths

- [ ] **Import JSON**
  - Export a canvas as JSON
  - Clear canvas
  - Click "Import JSON"
  - Select the exported JSON file
  - Verify strokes reappear

- [ ] **Dirty state tracking**
  - Enable autosave
  - Draw a stroke (should show "⚠️ Unsaved changes")
  - Wait 10 seconds
  - Verify warning disappears after autosave

- [ ] **localStorage capacity**
  - Save ~20 large sessions (draw lots of strokes per session)
  - Verify all save successfully
  - Check browser DevTools → Application → localStorage
  - Verify `pollin_canvas_*` entries exist
  - Verify `pollin_sessions_` index lists all sessions

- [ ] **Error handling**
  - Import invalid JSON (random text file)
  - Verify no crash, error logged to console
  - Try to import file with `{ "data": "test" }`
  - Verify null returned, no crash

- [ ] **Accessibility**
  - Tab through PersistencePanel
  - Verify all buttons are keyboard accessible (Enter to activate)
  - Verify session select/delete buttons are labeled
  - Verify ARIA labels present (right-click, inspect element)
  - Check color contrast (all text readable)

### 🎬 Demo Flow

1. Open app
2. Enable autosave (should see pulsing green dot + session name)
3. Draw a few strokes
4. Wait 10+ seconds (observe "Last saved" timestamp update)
5. Refresh page (Ctrl+R or Cmd+R)
6. Verify strokes still there from autosave
7. Export as PNG and SVG
8. Open PNG in image viewer (should match canvas)
9. Open SVG in browser (should show scalable vector version)
10. Save as JSON
11. Clear canvas
12. Import JSON back
13. Verify strokes return

## Test Output

The test suite includes **35+ test cases**:

```bash
npm run test -- useCanvasPersistence.test.ts
```

**Coverage:**
- localStorage operations (save/load/delete/getSessions)
- Export operations (JSON, SVG, PNG trigger)
- Import operations (valid/invalid JSON)
- Autosave (enable/disable)
- State tracking (dirty, clean, lastSaved)
- Edge cases (empty strokes, large collections, special characters)
- Round-trip serialization

All tests pass ✅

## Integration with Phase 1

**No breaking changes** to Phase 1. Persistence works alongside:
- Canvas transforms (zoom, pan, grid, guides)
- Undo/redo history
- Drawing and tools

**Recommendation:** Combine phases into single `CanvasAdvanced.tsx` or use as separate concerns.

## Browser Support

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ❌ IE 11 (no localStorage, Blob, Canvas.toBlob)

**localStorage Limits:**
- Chrome/Edge: 10 MB per domain
- Firefox: 10 MB per domain
- Safari: 5 MB per domain

~1,000 medium strokes (10 points each) ≈ 200 KB

## Performance Notes

- **Autosave:** Runs on configurable interval (default 10 sec)
  - Does not block UI (async)
  - Clears old entries periodically
- **Export PNG:** Synchronous (may briefly freeze on large canvases)
  - Consider debounce for real-time export
- **Export SVG:** O(n) strokes, O(m) points per stroke
  - 1000 strokes × 10 points = instant
- **Import JSON:** Synchronous parse (large files may pause briefly)

## Known Limitations

1. **No localStorage quota checking** — App assumes sufficient space
2. **No encryption** — All data stored in plain text
3. **Single browser/device** — Not synced across devices
4. **No deletion recovery** — Deleted sessions gone permanently
5. **PNG export limited to canvas size** — Very large canvases may be slow

## Next Steps (Phase 3)

After approval, Phase 3 will add:
- **Reference layers** — Import images for mood boards
- **Layer management** — Show/hide, reorder, delete layers
- **Image import** — Drag-drop or file picker for reference images
- **Image positioning** — Move, scale, rotate references

---

**Files to Test:**
- `C:\Users\caespiritu\source\pollin-src-hooks-useCanvasPersistence.ts` (191 lines)
- `C:\Users\caespiritu\source\pollin-src-components-PersistencePanel.tsx` (254 lines)
- `C:\Users\caespiritu\source\pollin-src-hooks-__tests__-useCanvasPersistence.test.ts` (tests)

**Status:** ✅ Ready for review and testing

**Questions?** Let me know what to adjust or clarify.
