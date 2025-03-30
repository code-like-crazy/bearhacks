"use client";

import { MutableRefObject, useEffect } from "react";

import { CustomFabricCanvas, ToolType } from "./types";

interface CanvasInitializerProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  fabricRef: MutableRefObject<CustomFabricCanvas | null>;
  handleCanvasMouseDown: (options: any) => void;
  handleCanvasMouseMove: (options: any) => void;
  handleCanvasMouseUp: () => void;
  handleMouseLeave: () => void;
  handlePathCreated: (options: any) => void;
  handleObjectModified: (options: any) => void;
  handleCanvasZoom: (options: any) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
}

export function CanvasInitializer({
  canvasRef,
  fabricRef,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleMouseLeave,
  handlePathCreated,
  handleObjectModified,
  handleCanvasZoom,
  handleKeyDown,
}: CanvasInitializerProps) {
  // Initialize canvas
  useEffect(() => {
    // Check if canvas is already initialized
    if (fabricRef.current) {
      console.log("Canvas already initialized, reusing existing instance");
      return;
    }

    if (!canvasRef.current) return;

    // Import fabric using V6 syntax
    import("fabric")
      .then((fabric) => {
        console.log("Fabric module in CanvasInitializer:", fabric);

        if (!("Canvas" in fabric)) {
          console.error("Fabric.js Canvas not found");
          return;
        }

        try {
          // Create canvas instance - we already checked canvasRef.current is not null above
          const canvas = new fabric.Canvas(canvasRef.current!, {
            width: window.innerWidth,
            height: window.innerHeight - 100, // Adjust for header/toolbar
            backgroundColor: "#f0f0f0",
            preserveObjectStacking: true,
            selection: true,
          });

          // Type assertion to match our custom type
          fabricRef.current = canvas as unknown as CustomFabricCanvas;

          // Setup canvas event listeners
          setupCanvasListeners(canvas);
        } catch (err) {
          console.error("Error creating canvas:", err);
        }
      })
      .catch((error) => {
        console.error("Error loading fabric:", error);
      });

    // Helper function to setup canvas event listeners
    function setupCanvasListeners(canvas: any) {
      // Handle window resize
      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight - 100,
        });
        canvas.renderAll();
      };

      window.addEventListener("resize", handleResize);

      // Setup event listeners
      canvas.on("mouse:down", handleCanvasMouseDown);
      canvas.on("mouse:move", handleCanvasMouseMove);
      canvas.on("mouse:up", handleCanvasMouseUp);
      canvas.on("mouse:out", handleMouseLeave);
      canvas.on("path:created", handlePathCreated);
      canvas.on("object:modified", handleObjectModified);
      canvas.on("mouse:wheel", handleCanvasZoom);

      // Handle keyboard events
      window.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        canvas.dispose();
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [
    canvasRef,
    fabricRef,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleMouseLeave,
    handlePathCreated,
    handleObjectModified,
    handleCanvasZoom,
    handleKeyDown,
  ]);

  return null;
}
