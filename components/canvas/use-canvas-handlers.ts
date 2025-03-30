"use client";

import { MutableRefObject, useCallback } from "react";
// Import fabric types
import type { Point } from "fabric/fabric-impl";
import { nanoid } from "nanoid";

import { useUpdateMyPresence } from "@/lib/liveblocks.config";

import { updateShapeDimensions } from "./shape-utils";
import { CustomFabricCanvas, CustomFabricObject, ToolType } from "./types";

interface UseCanvasHandlersProps {
  fabricRef: MutableRefObject<CustomFabricCanvas | null>;
  isDrawing: MutableRefObject<boolean>;
  shapeRef: MutableRefObject<CustomFabricObject | null>;
  activeObjectRef: MutableRefObject<CustomFabricObject | null>;
  activeTool: ToolType;
  currentColor: string;
  syncShapeInStorage: (object: any) => void;
  deleteShapeFromStorage: (shapeId: string) => void;
  history: {
    undo: () => void;
    redo: () => void;
  };
  createShape: (
    type: ToolType,
    pointer: { x: number; y: number },
    color: string,
  ) => Promise<CustomFabricObject>;
}

export function useCanvasHandlers({
  fabricRef,
  isDrawing,
  shapeRef,
  activeObjectRef,
  activeTool,
  currentColor,
  syncShapeInStorage,
  deleteShapeFromStorage,
  history,
  createShape,
}: UseCanvasHandlersProps) {
  // Update presence for cursor position
  const updateMyPresence = useUpdateMyPresence();
  const handleCanvasMouseDown = useCallback(
    (options: any) => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      // Get pointer coordinates
      const pointer = canvas.getPointer(options.e);

      // Get target object i.e., the object that is clicked
      const target = canvas.findTarget(options.e, false);

      // Set canvas drawing mode to false
      canvas.isDrawingMode = false;

      // If selected shape is freeform, set drawing mode to true and return
      if (activeTool === "pencil") {
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
        (target.type === activeTool || target.type === "activeSelection")
      ) {
        isDrawing.current = false;

        // Set active object to target
        canvas.setActiveObject(target);

        // Update coordinates
        target.setCoords();
      } else {
        isDrawing.current = true;

        // Create shape asynchronously
        createShape(activeTool, pointer, currentColor)
          .then((shape) => {
            // Set the shape to shapeRef
            shapeRef.current = shape;

            // Add it to canvas
            if (shapeRef.current) {
              canvas.add(shapeRef.current);
              canvas.renderAll();
            }
          })
          .catch((error) => {
            console.error("Error creating shape:", error);
          });
      }
    },
    [activeTool, currentColor, createShape],
  );

  const handleCanvasMouseMove = useCallback(
    (options: any) => {
      if (!fabricRef.current) return;

      const canvas = fabricRef.current;

      // Get pointer coordinates
      const pointer = canvas.getPointer(options.e);

      // Update cursor position in presence
      updateMyPresence({ cursor: { x: pointer.x, y: pointer.y } });

      // If not drawing or using pencil tool, return
      if (!isDrawing.current || activeTool === "pencil") return;

      canvas.isDrawingMode = false;

      // Update shape dimensions based on pointer coordinates
      if (!shapeRef.current) return;

      // Use the updateShapeDimensions utility function
      updateShapeDimensions(
        shapeRef.current,
        activeTool,
        { x: shapeRef.current.left || 0, y: shapeRef.current.top || 0 },
        pointer,
      );

      // Render objects on canvas
      canvas.renderAll();
    },
    [activeTool, updateMyPresence],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (!fabricRef.current) return;

    isDrawing.current = false;
    if (activeTool === "pencil") return;

    // Sync shape in storage as drawing is stopped
    if (shapeRef.current) {
      syncShapeInStorage(shapeRef.current);
    }

    // Reset references
    shapeRef.current = null;
    activeObjectRef.current = null;
  }, [activeTool, syncShapeInStorage]);

  // Handle mouse leave to clear cursor
  const handleMouseLeave = useCallback(() => {
    // Clear cursor position when mouse leaves canvas
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const handlePathCreated = useCallback(
    (options: { path: any }) => {
      // Get path object
      const path = options.path;
      if (!path) return;

      // Set unique id to path object
      path.set({
        objectId: nanoid(),
      });

      // Sync shape in storage
      syncShapeInStorage(path);
    },
    [syncShapeInStorage],
  );

  const handleObjectModified = useCallback(
    (options: { target?: any }) => {
      const target = options.target;
      if (!target) return;

      if (target.type === "activeSelection") {
        // Handle multiple selection
        const activeSelection = target as any;
        activeSelection.getObjects().forEach((obj: any) => {
          syncShapeInStorage(obj);
        });
      } else {
        // Handle single object
        syncShapeInStorage(target);
      }
    },
    [syncShapeInStorage],
  );

  const handleCanvasZoom = useCallback((options: any) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const delta = options.e?.deltaY;
    let zoom = canvas.getZoom();

    // Allow zooming to min 20% and max 300%
    const minZoom = 0.2;
    const maxZoom = 3;
    const zoomStep = 0.001;

    // Calculate zoom based on mouse scroll wheel with min and max zoom
    zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep * -1), maxZoom);

    // Import fabric using V6 syntax
    import("fabric")
      .then((fabric) => {
        console.log("Fabric module in useCanvasHandlers:", fabric);

        if (!("Point" in fabric)) {
          console.error("Fabric.js Point not found");
          return;
        }

        canvas.zoomToPoint(
          new fabric.Point(options.e.offsetX, options.e.offsetY),
          zoom,
        );
      })
      .catch((error) => {
        console.error("Error loading fabric:", error);
      });

    options.e.preventDefault();
    options.e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      // Delete key
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects || activeObjects.length === 0) return;

        // Remove each selected object
        activeObjects.forEach((obj: any) => {
          if (obj.objectId) {
            deleteShapeFromStorage(obj.objectId);
          }
          canvas.remove(obj);
        });

        // Clear selection and render
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        history.undo();
      }

      // Redo (Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z)
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        history.redo();
      }
    },
    [deleteShapeFromStorage, history],
  );

  return {
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleMouseLeave,
    handlePathCreated,
    handleObjectModified,
    handleCanvasZoom,
    handleKeyDown,
  };
}
