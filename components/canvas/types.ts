import { User as LiveblocksUser } from "@liveblocks/client";
import type { User } from "@liveblocks/client";
import type {
  ActiveSelection,
  Canvas,
  Object as FabricObject,
  ICircleOptions,
  IEvent,
  IGroupOptions,
  IObjectOptions,
  IRectOptions,
  ITextboxOptions,
  ITriangleOptions,
  Path,
  Point,
} from "fabric/fabric-impl";

// Base types
export interface IExtendedOptions extends IObjectOptions {
  objectId?: string;
}

export interface ICustomObject {
  objectId?: string;
  type?: string;
  left?: number;
  top?: number;
  set: (options: Partial<IExtendedOptions>) => ICustomObject;
  setCoords: () => void;
  toJSON: () => any;
}

export type CustomFabricObject = FabricObject & ICustomObject;

export interface ICustomCanvas {
  clipboard?: CustomFabricObject;
  isDrawingMode: boolean;
  freeDrawingBrush?: {
    width: number;
    color: string;
  };
  getPointer: (e: Event) => { x: number; y: number };
  findTarget: (e: Event, skipGroup: boolean) => CustomFabricObject | null;
  setActiveObject: (object: CustomFabricObject) => Canvas;
  add: (object: CustomFabricObject) => Canvas;
  remove: (object: CustomFabricObject) => Canvas;
  renderAll: () => void;
  clear: () => void;
  getZoom: () => number;
  zoomToPoint: (point: { x: number; y: number }, zoom: number) => void;
  getActiveObjects: () => CustomFabricObject[];
  discardActiveObject: () => Canvas;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  dispose: () => void;
}

export type CustomFabricCanvas = Canvas & ICustomCanvas;

export interface ICustomEvent<T extends Event = Event> {
  e: T;
  target?: CustomFabricObject;
}

// Event types
export interface IPathCreatedEvent {
  path: CustomFabricObject;
}

export interface IObjectModifiedEvent {
  target?: CustomFabricObject;
}

// Shape types
export type ShapeType = "rectangle" | "circle" | "triangle";
export type ToolType =
  | "select"
  | "sticky"
  | "pencil"
  | "text"
  | "eraser"
  | "stamp"
  | "shapes"
  | "image"
  | "grab"
  | ShapeType;

// Props types
export interface LiveCanvasProps {
  boardId: string;
  activeTool: ToolType;
  currentColor: string;
  scale?: number;
  position?: { x: number; y: number };
  setActiveTool?: (tool: ToolType) => void;
  onGeminiResponse?: (response: string) => void; // Add the callback prop
}

// Shape options
export type CustomShapeOptions =
  | (IRectOptions & { objectId?: string })
  | (ICircleOptions & { objectId?: string })
  | (ITriangleOptions & { objectId?: string })
  | (ITextboxOptions & { objectId?: string })
  | (IGroupOptions & { objectId?: string });

// Storage types
export type CanvasObjects = Map<string, any> | ReadonlyMap<string, any>;

// Cursor types
export interface CursorPosition {
  x: number;
  y: number;
}

export interface CursorData {
  x: number;
  y: number;
}

export interface Presence {
  cursor: CursorPosition | null;
  selection: string[] | null;
  [key: string]: any;
}

export interface CursorOverlayProps {
  others: ReadonlyArray<User<Presence, any>>;
}
