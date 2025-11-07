export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface TextElement extends CanvasElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
}

export interface ImageElement extends CanvasElement {
  type: 'image';
  src: string;
  opacity: number;
  filter: string;
}

export interface ShapeElement extends CanvasElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export type CanvasElementType = TextElement | ImageElement | ShapeElement;

export interface CanvasState {
  elements: CanvasElementType[];
  width: number;
  height: number;
  backgroundColor: string;
}
