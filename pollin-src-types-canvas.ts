export interface CanvasState {
  isDrawing: boolean;
  lineWidth: number;
  lineColor: string;
  tool: 'pen' | 'eraser' | 'select';
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface DrawPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface CanvasAction {
  type:
    | 'SET_DRAWING'
    | 'SET_LINE_WIDTH'
    | 'SET_LINE_COLOR'
    | 'SET_TOOL'
    | 'SET_ZOOM'
    | 'SET_OFFSET'
    | 'CLEAR_CANVAS'
    | 'UNDO'
    | 'REDO';
  payload?: unknown;
}

export interface DrawingStroke {
  points: DrawPoint[];
  color: string;
  lineWidth: number;
  timestamp: number;
}
