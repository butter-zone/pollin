# Pollin Testing & Approval Checklist

## 📋 Pre-Testing Setup

- [ ] Copy all `pollin-*` files from `C:\Users\caespiritu\source\` to your local pollin repo
- [ ] Copy all `.md` documentation files to the repo root
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` to start development server
- [ ] Open http://localhost:5173 (or the URL shown)
- [ ] Verify canvas loads and is interactive

---

## ✅ Phase 1: Advanced Canvas Features

**Reference:** PHASE-1-REVIEW.md

### Basic Functionality
- [ ] Canvas renders without errors
- [ ] Can draw strokes with mouse
- [ ] Strokes appear in correct color
- [ ] Can change brush size and see difference
- [ ] Can change color in control panel

### Zoom & Pan
- [ ] Zoom in with scroll wheel (should go up to 5×)
- [ ] Zoom out with scroll wheel (should go down to 0.1×)
- [ ] Zoom stays within 0.1× – 5× bounds
- [ ] Pan with spacebar + drag (or middle-click + drag)
- [ ] Pan moves view smoothly
- [ ] Can zoom and pan together

### Grid & Guides
- [ ] Grid overlay appears when enabled
- [ ] Grid is semi-transparent (doesn't block drawing)
- [ ] Can toggle grid on/off
- [ ] Can toggle guides on/off
- [ ] Snap-to-grid works (strokes snap when placing)
- [ ] Grid scales with zoom level

### Undo/Redo
- [ ] Draw a stroke
- [ ] Press Ctrl+Z (or Cmd+Z on Mac) → stroke disappears
- [ ] Press Ctrl+Shift+Z → stroke reappears
- [ ] Undo/redo works multiple times (5+ strokes)
- [ ] Redo clears when drawing after undo

### Keyboard Shortcuts
- [ ] Ctrl+Z works for undo
- [ ] Ctrl+Shift+Z works for redo
- [ ] Spacebar + drag works for pan
- [ ] Escape or other keys don't interfere

### Edge Cases
- [ ] Very small zoom (0.1×) still usable
- [ ] Very large zoom (5×) still responsive
- [ ] Drawing thousands of strokes doesn't lag significantly
- [ ] Undo/redo with 50+ strokes works smoothly

### Issues Found
```
(none yet — please report here)
```

---

## ✅ Phase 2: Persistence & Export

**Reference:** PHASE-2-REVIEW.md

### Save/Load Sessions
- [ ] Click "Save" button in Persistence Panel
- [ ] Session appears in "Saved Sessions" list
- [ ] Session shows stroke count and timestamp
- [ ] Click load button (📂) → strokes reappear
- [ ] Can save multiple sessions with different names
- [ ] Can load any saved session

### Session Management
- [ ] Edit session name before saving
- [ ] Session name updates in list
- [ ] Click delete button (🗑️) on a session
- [ ] Session disappears from list
- [ ] Can create, load, and delete multiple sessions

### Autosave
- [ ] Click "Autosave" button (🔄)
- [ ] Green pulsing dot appears with "Autosaving to: [session-name]"
- [ ] Draw a stroke
- [ ] Wait 10 seconds
- [ ] "Last saved" timestamp appears
- [ ] Refresh page (Ctrl+R / Cmd+R)
- [ ] Strokes still there from autosave
- [ ] Click "Autosave" again to disable
- [ ] Green indicator and autosave stop

### Dirty State Indicator
- [ ] Enable autosave
- [ ] Draw a stroke
- [ ] "⚠️ Unsaved changes" warning appears
- [ ] Wait 10 seconds for autosave to complete
- [ ] Warning disappears
- [ ] Draw another stroke
- [ ] Warning reappears

### Export JSON
- [ ] Draw several strokes
- [ ] Click "Export JSON" button (📋)
- [ ] File downloads as `canvas-{timestamp}.json`
- [ ] Open file in text editor
- [ ] Verify JSON contains version, timestamp, and strokes array
- [ ] JSON is valid (parse it in JSON validator)

### Export PNG
- [ ] Draw colorful strokes
- [ ] Click "Export PNG" button (🖼️)
- [ ] File downloads as `canvas-{timestamp}.png`
- [ ] Open in image viewer
- [ ] Image matches canvas exactly (same colors, positions)
- [ ] No artifacts or distortion

### Export SVG
- [ ] Draw strokes with different colors/widths
- [ ] Click "Export SVG" button (✏️)
- [ ] File downloads as `canvas-{timestamp}.svg`
- [ ] Open in browser or vector editor
- [ ] Strokes appear as paths
- [ ] Colors match original strokes
- [ ] Line widths are correct

### Import JSON
- [ ] Export a canvas as JSON
- [ ] Clear canvas (delete all strokes)
- [ ] Click "Import JSON" button (📂)
- [ ] Select the exported JSON file
- [ ] Strokes reappear exactly as before
- [ ] Colors, positions, and widths match original

### Error Handling
- [ ] Try to import invalid JSON (any text file)
- [ ] App doesn't crash
- [ ] Error logged to console (DevTools → Console)
- [ ] Try importing file with wrong format
- [ ] App handles gracefully

### Storage & Capacity
- [ ] Save 10+ large sessions (many strokes each)
- [ ] All save successfully
- [ ] Open DevTools (F12) → Application → localStorage
- [ ] Verify `pollin_canvas_*` entries exist
- [ ] Verify `pollin_sessions_` index lists all
- [ ] No storage quota errors

### Issues Found
```
(none yet — please report here)
```

---

## ✅ Phase 3: References & Mood Board

**Reference:** PHASE-3-REVIEW.md

### Drag & Drop Image Upload
- [ ] Find an image on desktop or web
- [ ] Drag onto canvas
- [ ] Image appears in "References" panel
- [ ] Thumbnail shows in reference list
- [ ] Image appears at drop position

### File Picker Upload
- [ ] Click upload area in References panel
- [ ] File picker dialog opens
- [ ] Select an image file
- [ ] Image appears in reference list

### Multiple References
- [ ] Add 3+ images
- [ ] All appear in reference list
- [ ] Count updates ("References (3)")
- [ ] Each has thumbnail and controls

### Reference Controls
- [ ] Adjust opacity slider (0–100%)
  - Opacity value updates in display
  - In final render, image should fade
- [ ] Adjust rotation slider (0–360°)
  - Rotation value updates
  - In final render, image should rotate
- [ ] View size indicator (width × height)

### Move References
- [ ] Click and drag image thumbnail
- [ ] Drag gesture is smooth
- [ ] Thumbnail shows blue ring while dragging
- [ ] Cursor changes to grab/grabbing

### Delete References
- [ ] Add a reference
- [ ] Click ✕ button on reference
- [ ] Reference removed from list
- [ ] Count decrements

### Clear All References
- [ ] Add multiple references
- [ ] Click "Clear All References" button
- [ ] Confirmation dialog appears
- [ ] Click OK
- [ ] All references removed
- [ ] Count resets to 0

### Large Image Handling
- [ ] Add very large image (4000×4000px+)
- [ ] Scales to default size (300×300px)
- [ ] No lag or freezing
- [ ] App remains responsive

### Collapsible Panel
- [ ] References panel shows header with count
- [ ] Click ▶/▼ to expand/collapse
- [ ] Controls only show when expanded
- [ ] Panel animates smoothly

### Issues Found
```
(none yet — please report here)
```

---

## ♿ Accessibility Audit

**Reference:** ACCESSIBILITY.md

### Keyboard Navigation
- [ ] Tab through all controls in order
- [ ] Focus visible on every interactive element
- [ ] Can activate buttons with Enter or Space
- [ ] Can use sliders with arrow keys
- [ ] No keyboard traps (can always tab away)

### Screen Reader (optional)
- [ ] All buttons have aria-labels
- [ ] Panel regions have aria-labels
- [ ] Inputs have associated labels
- [ ] Important state changes announced

### Color Contrast
- [ ] All text readable on background
- [ ] Controls visible at 100% zoom
- [ ] No reliance on color alone (icons + text)

### Focus States
- [ ] Buttons have clear focus outline
- [ ] Links have clear focus outline
- [ ] Sliders show focus state
- [ ] Focus moves logically through page

---

## 🐛 Bug Report Template

If you find a bug, please provide:

```
### Issue Title
[Brief description]

### Phase
[ ] Phase 1 (Canvas)
[ ] Phase 2 (Persistence)
[ ] Phase 3 (References)

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux]
- Screenshot/Video: [if possible]

### Severity
[ ] Critical (blocks usage)
[ ] High (major feature broken)
[ ] Medium (feature doesn't work as intended)
[ ] Low (cosmetic or minor issue)
```

---

## 💬 Feedback & Feature Requests

### Feedback Format

**I like:**
- [What's working well]

**I'd change:**
- [What should be different and why]

**I'd add:**
- [New features or improvements]

---

## ✅ Final Approval

When you've tested all three phases and are satisfied:

- [ ] All phases tested
- [ ] No critical bugs
- [ ] Accessibility verified
- [ ] Ready to commit

**Next step:** Reply with ✅ approval, and I'll provide exact git commands to commit and push.

---

## 📝 Notes

```
[Add any notes, observations, or questions here]
```

---

**Date Started:** ___________  
**Date Completed:** ___________  
**Overall Status:** [ ] Approved [ ] Needs Changes [ ] In Progress

---

**Thank you for testing!** Your feedback drives the next phase of development. 🚀
