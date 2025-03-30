"use client";

import { MutableRefObject, useEffect } from "react";

import { CanvasObjects, CustomFabricCanvas, CustomFabricObject } from "./types";

interface CanvasRendererProps {
  fabricRef: MutableRefObject<CustomFabricCanvas | null>;
  activeObjectRef: MutableRefObject<CustomFabricObject | null>;
  canvasObjects: CanvasObjects | undefined;
}

export function CanvasRenderer({
  fabricRef,
  activeObjectRef,
  canvasObjects,
}: CanvasRendererProps) {
  // Render canvas objects from storage
  useEffect(() => {
    if (!fabricRef.current || !canvasObjects) return;

    // Clear canvas
    fabricRef.current.clear();

    // Import fabric using V6 syntax
    import("fabric")
      .then((fabric) => {
        console.log("Fabric module in CanvasRenderer:", fabric);

        if (
          !("util" in fabric) ||
          !fabric.util ||
          typeof fabric.util.enlivenObjects !== "function"
        ) {
          console.error("Fabric.js util.enlivenObjects not found");
          return;
        }

        // Render all objects on canvas
        Array.from(canvasObjects.entries()).forEach(
          ([objectId, objectData]) => {
            // Use type assertion for the entire function call
            (fabric.util.enlivenObjects as any)(
              [objectData],
              (enlivenedObjects: any[]) => {
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
          },
        );

        if (fabricRef.current) {
          fabricRef.current.renderAll();
        }
      })
      .catch((error) => {
        console.error("Error loading fabric:", error);
      });
  }, [canvasObjects, fabricRef, activeObjectRef]);

  return null;
}
