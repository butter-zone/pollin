// ── Primitives ──────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
}

export interface DrawPoint extends Point {
  timestamp: number;
  pressure?: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Object types on the canvas ──────────────────────────
export type ObjectKind = 'stroke' | 'rect' | 'ellipse' | 'line' | 'image' | 'text' | 'component';

interface BaseObject {
  id: string;
  kind: ObjectKind;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name: string;
  timestamp: number;
}

export interface StrokeObject extends BaseObject {
  kind: 'stroke';
  points: DrawPoint[];
  color: string;
  lineWidth: number;
}

export interface RectObject extends BaseObject {
  kind: 'rect';
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export interface EllipseObject extends BaseObject {
  kind: 'ellipse';
  radiusX: number;
  radiusY: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface LineObject extends BaseObject {
  kind: 'line';
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

export interface ImageObject extends BaseObject {
  kind: 'image';
  src: string;
  width: number;
  height: number;
}

export interface TextObject extends BaseObject {
  kind: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  width: number;
}

export interface ComponentObject extends BaseObject {
  kind: 'component';
  /** Structured component tree (editable) */
  tree: import('./component-tree').ComponentTree;
  /** Cached render — pollin-img:// ref to the rasterized preview */
  cachedImageRef?: string;
  width: number;
  height: number;
}

export type CanvasObject =
  | StrokeObject
  | RectObject
  | EllipseObject
  | LineObject
  | ImageObject
  | TextObject
  | ComponentObject;

// ── Legacy compat alias ─────────────────────────────────
export interface DrawingStroke {
  points: DrawPoint[];
  color: string;
  lineWidth: number;
  timestamp: number;
}

// ── Tools ───────────────────────────────────────────────
export type Tool =
  | 'select'
  | 'pen'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'eraser'
  | 'hand';

// ── App-level canvas state ──────────────────────────────
export interface CanvasState {
  // Tool & drawing
  activeTool: Tool;
  isDrawing: boolean;
  lineWidth: number;
  lineColor: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius: number;
  opacity: number;

  // Objects
  objects: CanvasObject[];
  selectedIds: string[];

  // Viewport
  zoom: number;
  panX: number;
  panY: number;

  // Guides
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;

  // Legacy compat
  tool: Tool;
  offsetX: number;
  offsetY: number;
}

// ── Design System Library ───────────────────────────────
export interface LibraryComponent {
  id: string;
  name: string;
  category?: string;
  description?: string;
  preview?: string; // URL or data URI
  code?: string; // React/HTML code snippet
  props?: Record<string, unknown>;
}

export interface DesignLibrary {
  id: string;
  name: string;
  description?: string;
  source: 'builtin' | 'figma' | 'npm' | 'github' | 'other';
  sourceUrl?: string;
  components: LibraryComponent[];
  active: boolean;
}

export interface ConversionContext {
  isOpen: boolean;
  type: 'sketch' | 'image' | null;
  targetId?: string;
  selectedLibraryId?: string;
  prompt?: string;
}

// ── Extended Canvas State with Library Support ──────────
export interface CanvasStateWithLibraries extends CanvasState {
  libraries: DesignLibrary[];
  conversionUI: ConversionContext;
}

export type CanvasAction =
  | { type: 'SET_TOOL'; payload: Tool }
  | { type: 'SET_DRAWING'; payload: boolean }
  | { type: 'SET_LINE_WIDTH'; payload: number }
  | { type: 'SET_LINE_COLOR'; payload: string }
  | { type: 'SET_FILL_COLOR'; payload: string }
  | { type: 'SET_STROKE_COLOR'; payload: string }
  | { type: 'SET_STROKE_WIDTH'; payload: number }
  | { type: 'SET_CORNER_RADIUS'; payload: number }
  | { type: 'SET_OPACITY'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'SET_OFFSET'; payload: { x: number; y: number } }
  | { type: 'ADD_OBJECT'; payload: CanvasObject }
  | { type: 'UPDATE_OBJECT'; payload: { id: string; changes: Partial<CanvasObject> } }
  | { type: 'DELETE_OBJECTS'; payload: string[] }
  | { type: 'SET_SELECTION'; payload: string[] }
  | { type: 'SET_OBJECTS'; payload: CanvasObject[] }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_GRID_SIZE'; payload: number }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'ADD_LIBRARY'; payload: DesignLibrary }
  | { type: 'REMOVE_LIBRARY'; payload: string }
  | { type: 'TOGGLE_LIBRARY'; payload: string }
  | { type: 'OPEN_CONVERSION'; payload: ConversionContext }
  | { type: 'CLOSE_CONVERSION' }
  | { type: 'SET_CONVERSION_PROMPT'; payload: string };
