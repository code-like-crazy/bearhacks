import { fabric } from "fabric";
import { nanoid } from "nanoid";

// Add objectId to fabric Object type
declare module "fabric" {
  namespace fabric {
    interface Object {
      objectId?: string;
    }
    interface Canvas {
      clipboard?: fabric.Object;
    }
  }
}

// Initialize fabric canvas
export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  // Get canvas element
  const canvasElement = document.getElementById("canvas");

  if (!canvasRef.current) return null;

  // Create fabric canvas
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth || window.innerWidth,
    height: canvasElement?.clientHeight || window.innerHeight,
    backgroundColor: "#f0f0f0",
    preserveObjectStacking: true,
    selection: true,
  });

  // Set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = canvas;

  return canvas;
};

// Create specific shape based on type
export const createShape = (
  type: string,
  pointer: { x: number; y: number },
  color: string = "#000000",
) => {
  let shape: fabric.Object;

  switch (type) {
    case "rectangle":
      shape = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
        objectId: nanoid(),
      });
      break;

    case "circle":
      shape = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        radius: 50,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
        objectId: nanoid(),
      });
      break;

    case "triangle":
      shape = new fabric.Triangle({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
        objectId: nanoid(),
      });
      break;

    case "line":
      shape = new fabric.Line(
        [pointer.x, pointer.y, pointer.x + 100, pointer.y],
        {
          stroke: color,
          strokeWidth: 2,
          objectId: nanoid(),
        },
      );
      break;

    case "text":
      shape = new fabric.Textbox("Edit this text", {
        left: pointer.x,
        top: pointer.y,
        fontFamily: "Arial",
        fontSize: 20,
        fill: color,
        width: 200,
        objectId: nanoid(),
      });
      break;

    case "sticky":
      const rect = new fabric.Rect({
        left: 0,
        top: 0,
        width: 150,
        height: 150,
        fill: color || "#f8e71c",
        rx: 10,
        ry: 10,
      });

      const text = new fabric.Textbox("Add note here...", {
        left: 10,
        top: 10,
        fontFamily: "Arial",
        fontSize: 16,
        fill: "#000000",
        width: 130,
      });

      // Group the sticky note and text
      shape = new fabric.Group([rect, text], {
        left: pointer.x,
        top: pointer.y,
        objectId: nanoid(),
      });
      break;

    default:
      // Default to rectangle
      shape = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
        objectId: nanoid(),
      });
  }

  return shape;
};

// Handle canvas mouse down event
export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
  currentColor,
}: {
  options: fabric.TEvent<MouseEvent>;
  canvas: fabric.Canvas;
  selectedShapeRef: React.MutableRefObject<string | null>;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  currentColor: string;
}) => {
  // Get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  // Get target object i.e., the object that is clicked
  const target = canvas.findTarget(options.e);

  // Set canvas drawing mode to false
  canvas.isDrawingMode = false;

  // If selected shape is freeform, set drawing mode to true and return
  if (selectedShapeRef.current === "pencil") {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = currentColor;
    }
    return;
  }

  // If target is the selected shape or active selection, set isDrawing to false
  if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === "activeSelection")
  ) {
    isDrawing.current = false;

    // Set active object to target
    canvas.setActiveObject(target);

    // Update coordinates
    target.setCoords();
  } else {
    isDrawing.current = true;

    // Create shape and set it to shapeRef
    shapeRef.current = createShape(
      selectedShapeRef.current || "rectangle",
      pointer,
      currentColor,
    );

    // If shapeRef is not null, add it to canvas
    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
};

// Handle canvas mouse move event
export const handleCanvasMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: {
  options: fabric.TEvent<MouseEvent>;
  canvas: fabric.Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  selectedShapeRef: React.MutableRefObject<string | null>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  syncShapeInStorage: (object: fabric.Object) => void;
}) => {
  // If not drawing or selected shape is freeform, return
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === "pencil") return;

  canvas.isDrawingMode = false;

  // Get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  // Update shape dimensions based on pointer coordinates
  if (!shapeRef.current) return;

  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "circle":
      const radius = Math.abs(
        Math.sqrt(
          Math.pow(pointer.x - (shapeRef.current?.left || 0), 2) +
            Math.pow(pointer.y - (shapeRef.current?.top || 0), 2),
        ),
      );
      (shapeRef.current as fabric.Circle)?.set({
        radius: radius / 2,
      });
      break;

    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "line":
      (shapeRef.current as fabric.Line)?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    default:
      break;
  }

  // Render objects on canvas
  canvas.renderAll();

  // Sync shape in storage
  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
};

// Handle canvas mouse up event
export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: {
  canvas: fabric.Canvas;
  isDrawing: React.MutableRefObject<boolean>;
  shapeRef: React.MutableRefObject<fabric.Object | null>;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
  selectedShapeRef: React.MutableRefObject<string | null>;
  syncShapeInStorage: (object: fabric.Object) => void;
  setActiveElement: (element: {
    name: string;
    value: string;
    icon: string;
  }) => void;
}) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === "pencil") return;

  // Sync shape in storage as drawing is stopped
  if (shapeRef.current) {
    syncShapeInStorage(shapeRef.current);
  }

  // Reset references
  shapeRef.current = null;
  activeObjectRef.current = null;
};

// Handle path created event
export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: {
  options: { path: fabric.Path };
  syncShapeInStorage: (object: fabric.Object) => void;
}) => {
  // Get path object
  const path = options.path;
  if (!path) return;

  // Set unique id to path object
  path.set({
    objectId: nanoid(),
  });

  // Sync shape in storage
  syncShapeInStorage(path);
};

// Handle object modified event
export const handleObjectModified = ({
  options,
  syncShapeInStorage,
}: {
  options: { target?: fabric.Object };
  syncShapeInStorage: (object: fabric.Object) => void;
}) => {
  const target = options.target;
  if (!target) return;

  if (target.type === "activeSelection") {
    // Handle multiple selection
    const activeSelection = target as fabric.ActiveSelection;
    activeSelection.getObjects().forEach((obj) => {
      syncShapeInStorage(obj);
    });
  } else {
    // Handle single object
    syncShapeInStorage(target);
  }
};

// Render canvas objects from storage
export const renderCanvas = ({
  fabricRef,
  canvasObjects,
  activeObjectRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasObjects: Map<string, any>;
  activeObjectRef: React.MutableRefObject<fabric.Object | null>;
}) => {
  // Clear canvas
  fabricRef.current?.clear();

  // Render all objects on canvas
  Array.from(canvasObjects, ([objectId, objectData]) => {
    fabric.util.enlivenObjects(
      [objectData],
      (enlivenedObjects: fabric.Object[]) => {
        enlivenedObjects.forEach((enlivenedObj) => {
          // If element is active, keep it in active state
          if (activeObjectRef.current?.objectId === objectId) {
            fabricRef.current?.setActiveObject(enlivenedObj);
          }

          // Add object to canvas
          fabricRef.current?.add(enlivenedObj);
        });
      },
      "fabric",
    );
  });

  fabricRef.current?.renderAll();
};

// Handle canvas zoom
export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: fabric.TEvent<WheelEvent>;
  canvas: fabric.Canvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();

  // Allow zooming to min 20% and max 100%
  const minZoom = 0.2;
  const maxZoom = 3;
  const zoomStep = 0.001;

  // Calculate zoom based on mouse scroll wheel with min and max zoom
  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep * -1), maxZoom);

  // Set zoom to canvas
  canvas.zoomToPoint(
    new fabric.Point(options.e.offsetX, options.e.offsetY),
    zoom,
  );

  options.e.preventDefault();
  options.e.stopPropagation();
};

// Handle window resize
export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const canvasElement = document.getElementById("canvas");
  if (!canvasElement) return;

  if (!canvas) return;

  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

// Delete object from canvas
export const deleteObject = (
  canvas: fabric.Canvas,
  deleteFromStorage: (id: string) => void,
) => {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  // Remove each selected object
  activeObjects.forEach((obj) => {
    if (obj.objectId) {
      deleteFromStorage(obj.objectId);
    }
    canvas.remove(obj);
  });

  // Clear selection and render
  canvas.discardActiveObject();
  canvas.renderAll();
};

// Handle key down events
export const handleKeyDown = ({
  e,
  canvas,
  deleteFromStorage,
  syncShapeInStorage,
  undo,
  redo,
}: {
  e: KeyboardEvent;
  canvas: fabric.Canvas | null;
  deleteFromStorage: (id: string) => void;
  syncShapeInStorage: (object: fabric.Object) => void;
  undo: () => void;
  redo: () => void;
}) => {
  if (!canvas) return;

  // Delete key
  if (e.key === "Delete" || e.key === "Backspace") {
    deleteObject(canvas, deleteFromStorage);
  }

  // Undo (Ctrl/Cmd + Z)
  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    undo();
  }

  // Redo (Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z)
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.shiftKey && e.key === "z"))
  ) {
    redo();
  }

  // Copy (Ctrl/Cmd + C)
  if ((e.ctrlKey || e.metaKey) && e.key === "c") {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone(function (cloned: fabric.Object) {
        canvas.clipboard = cloned;
      });
    }
  }

  // Paste (Ctrl/Cmd + V)
  if ((e.ctrlKey || e.metaKey) && e.key === "v") {
    if (canvas.clipboard) {
      canvas.clipboard.clone(function (clonedObj: fabric.Object) {
        clonedObj.set({
          left: (clonedObj.left || 0) + 10,
          top: (clonedObj.top || 0) + 10,
          objectId: nanoid(),
        });
        canvas.add(clonedObj);
        canvas.setActiveObject(clonedObj);
        syncShapeInStorage(clonedObj);
      });
    }
  }
};

// Handle image upload
export const handleImageUpload = ({
  file,
  canvas,
  syncShapeInStorage,
}: {
  file: File;
  canvas: React.MutableRefObject<fabric.Canvas | null>;
  syncShapeInStorage: (object: fabric.Object) => void;
}) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!e.target?.result) return;

    fabric.Image.fromURL(e.target.result.toString(), function (img) {
      // Scale image to fit within a reasonable size
      const maxSize = 300;
      const scale = Math.min(maxSize / img.width!, maxSize / img.height!);

      img.set({
        left: 100,
        top: 100,
        scaleX: scale,
        scaleY: scale,
        objectId: nanoid(),
      });

      canvas.current?.add(img);
      canvas.current?.setActiveObject(img);
      syncShapeInStorage(img);
    });
  };
  reader.readAsDataURL(file);
};
