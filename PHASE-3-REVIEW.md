# Phase 3: References & Mood Board — READY FOR REVIEW

## What's New

Phase 3 adds **reference image management** for mood boarding and design inspiration. Users can now:

- 🖼️ **Drag & Drop Images** — Drop images directly onto canvas or via upload dialog
- 📌 **Pin References** — Keep reference images on separate layer
- 🎨 **Adjust References** — Move, rotate, scale, and adjust opacity
- 🎬 **Smooth Interaction** — Drag references around with smooth feedback
- 🗑️ **Manage References** — View all references, delete individual or all
- ⌨️ **Keyboard Accessible** — Full WCAG AA keyboard navigation

## Architecture

### New Hook

**`useCanvasReferences()`** (163 lines)
- Manages reference image state and operations
- Image file handling with async loading
- CRUD operations for references
- Transform operations (move, scale, rotate, opacity)

**Returns:**
```typescript
{
  references: ImageReference[];
  addReference: (file, x, y) => Promise<void>;
  removeReference: (id) => void;
  updateReference: (id, updates) => void;
  moveReference: (id, x, y) => void;
  scaleReference: (id, width, height) => void;
  rotateReference: (id, rotation) => void;
  setReferenceOpacity: (id, opacity) => void;
  clearAllReferences: () => void;
  getReference: (id) => ImageReference | undefined;
}
```

**ImageReference Type:**
```typescript
interface ImageReference {
  id: string;
  src: string;                    // Data URL
  x: number;                      // Canvas position
  y: number;
  width: number;                  // Display size
  height: number;
  rotation: number;               // 0–360 degrees
  opacity: number;                // 0–1
  timestamp: Date;
}
```

### New Component

**`ReferencePanel.tsx`** (338 lines)
- Collapsible UI panel for reference management
- Drag-and-drop upload area
- File picker fallback
- Reference list with inline controls
  - Thumbnail preview
  - Opacity slider (0–100%)
  - Rotation slider (0–360°)
  - Size indicator
  - Delete button
- Drag-to-move on canvas (visual feedback)
- "Clear all" with confirmation
- Full accessibility (ARIA labels, keyboard nav)

## How to Use (Integration)

### Basic Setup

```tsx
import { useCanvasReferences } from '@/hooks/useCanvasReferences';
import { ReferencePanel } from '@/components/ReferencePanel';

function Canvas() {
  const { references, addReference, removeReference, updateReference } = useCanvasReferences();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      <canvas 
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          for (let i = 0; i < files.length; i++) {
            addReference(files[i], e.clientX, e.clientY);
          }
        }}
      />
      
      <ReferencePanel
        onAddReference={addReference}
        references={references}
        onRemoveReference={removeReference}
        onUpdateReference={updateReference}
        canvasWidth={canvasRef.current?.width || 800}
        canvasHeight={canvasRef.current?.height || 600}
      />
    </>
  );
}
```

### Rendering References

For real rendering (not just state), add to canvas draw loop:

```tsx
useEffect(() => {
  const ctx = canvasRef.current?.getContext('2d');
  if (!ctx) return;

  // ... draw strokes ...

  // Draw references on top
  references.forEach(ref => {
    ctx.save();
    ctx.translate(ref.x + ref.width / 2, ref.y + ref.height / 2);
    ctx.rotate((ref.rotation * Math.PI) / 180);
    ctx.globalAlpha = ref.opacity;
    ctx.drawImage(img, -ref.width / 2, -ref.height / 2, ref.width, ref.height);
    ctx.restore();
  });
}, [references]);
```

## How to Test

### ✅ Test Checklist

- [ ] **Add image via drag-drop**
  - Find an image on desktop or web
  - Drag onto canvas
  - Verify image appears in reference list
  - Verify thumbnail shows in list

- [ ] **Add image via upload button**
  - Click upload area in ReferencePanel
  - Select image file
  - Verify image appears in list

- [ ] **Multiple images**
  - Add 3+ images
  - Verify all appear in reference list
  - Verify count updates ("References (3)")

- [ ] **Move reference**
  - Click and drag thumbnail
  - Verify it moves smoothly
  - Verify position displays (console check for now)

- [ ] **Adjust opacity**
  - Select a reference
  - Drag opacity slider (0–100%)
  - Verify percentage updates
  - In final render, verify image fades

- [ ] **Rotate reference**
  - Select a reference
  - Drag rotation slider (0–360°)
  - Verify angle updates
  - In final render, verify image rotates

- [ ] **Delete reference**
  - Add reference
  - Click ✕ button
  - Verify reference removed from list
  - Verify count decrements

- [ ] **Clear all**
  - Add multiple references
  - Click "Clear All References"
  - Confirm delete prompt
  - Verify all removed
  - Verify count resets to 0

- [ ] **Large image handling**
  - Add very large image (4000×4000px)
  - Verify it scales to default 300×300px
  - Verify no lag or freezing

- [ ] **Drag-to-move feedback**
  - Start dragging image thumbnail
  - Verify it shows blue ring (isDragging state)
  - Verify cursor changes to grab/grabbing

- [ ] **Accessibility**
  - Tab through panel controls
  - Verify sliders work with keyboard (arrow keys)
  - Verify delete buttons focus and respond to Enter
  - Verify ARIA labels present

### 🎬 Demo Flow

1. Open app
2. Drag an image from desktop onto canvas
3. Verify it appears in reference list
4. Adjust opacity to 50%
5. Rotate 45°
6. Click and drag to move it
7. Add another image
8. Click clear all and confirm
9. Verify both removed

## Files to Test

- `C:\Users\caespiritu\source\pollin-src-hooks-useCanvasReferences.ts` (163 lines)
- `C:\Users\caespiritu\source\pollin-src-components-ReferencePanel.tsx` (338 lines)

## Integration Points

**With Phase 1 (Canvas Transforms):**
- References work independently of zoom/pan/grid
- Consider whether references should scale with zoom (design decision)

**With Phase 2 (Persistence):**
- References stored as base64 data URLs in localStorage
- Can be included in JSON export
- Consider storage size (images are large)

## Known Limitations

1. **No rendering yet** — ReferencePanel manages state, but doesn't render to canvas
   - Will be added in Phase 4 (Canvas Rendering Integration)
2. **No image caching** — Large images stored as data URLs (can hit storage limits)
3. **No layer ordering** — All references on same layer
4. **No grouping** — Each reference independent

## Next Steps (Phase 4)

After approval, Phase 4 will add:
- **Canvas rendering** — Actually draw references on canvas
- **Layer panel** — Show/hide, reorder, group references
- **Reference selection** — Click to select, visual feedback
- **Transform handles** — Corner and edge handles for resizing
- **Design system colors** — Color samples from references

---

**Status:** ✅ Ready for review and testing

**Questions?** Let me know what to adjust or clarify.
