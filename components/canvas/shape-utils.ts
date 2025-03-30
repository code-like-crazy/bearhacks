"use client";

import { nanoid } from "nanoid";

import {
  CustomFabricObject,
  CustomShapeOptions,
  ShapeType,
  ToolType,
} from "./types";

/**
 * Creates a new shape based on the specified type and position
 * @param type The type of shape to create
 * @param pointer The position where the shape should be created
 * @param color The color of the shape
 * @returns The created shape
 */
export async function createShape(
  type: ToolType,
  pointer: { x: number; y: number },
  color: string,
): Promise<CustomFabricObject> {
  try {
    // Import fabric using V6 syntax
    const fabric = await import("fabric");

    // Log the fabric module to debug
    console.log("Fabric module in createShape:", fabric);

    // Check if required fabric classes exist
    if (
      !("Rect" in fabric) ||
      !("Circle" in fabric) ||
      !("Triangle" in fabric) ||
      !("Textbox" in fabric) ||
      !("Group" in fabric)
    ) {
      console.error("Required Fabric.js classes not found");
      throw new Error("Required Fabric.js classes not found");
    }

    let shape: any;

    switch (type) {
      case "shape":
      case "rectangle":
        shape = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 100,
          height: 100,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
          selectable: true,
          hasControls: true,
        } as any);
        shape.objectId = nanoid();
        break;

      case "circle":
        shape = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 50,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
          selectable: true,
          hasControls: true,
        } as any);
        shape.objectId = nanoid();
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
          selectable: true,
          hasControls: true,
        } as any);
        shape.objectId = nanoid();
        break;

      case "text":
        shape = new fabric.Textbox("Edit this text", {
          left: pointer.x,
          top: pointer.y,
          fontFamily: "Arial",
          fontSize: 20,
          fill: color,
          width: 200,
          selectable: true,
          hasControls: true,
        } as any);
        shape.objectId = nanoid();
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
          selectable: true,
          hasControls: true,
        } as any);
        shape.objectId = nanoid();
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
          selectable: true,
          hasControls: true,
        } as any);
        shape.objectId = nanoid();
    }

    return shape as unknown as CustomFabricObject;
  } catch (error) {
    console.error("Error creating shape:", error);
    throw error;
  }
}

/**
 * Updates the shape dimensions based on the current pointer position
 * @param shape The shape to update
 * @param type The type of the shape
 * @param startPoint The starting point of the shape
 * @param currentPoint The current pointer position
 */
export function updateShapeDimensions(
  shape: CustomFabricObject,
  type: ToolType,
  startPoint: { x: number; y: number },
  currentPoint: { x: number; y: number },
): void {
  if (!shape) return;

  switch (type) {
    case "shape":
    case "rectangle":
      shape.set({
        width: currentPoint.x - (shape.left || 0),
        height: currentPoint.y - (shape.top || 0),
      });
      break;

    case "circle":
      const radius = Math.abs(
        Math.sqrt(
          Math.pow(currentPoint.x - (shape.left || 0), 2) +
            Math.pow(currentPoint.y - (shape.top || 0), 2),
        ),
      );
      (shape as any).set({
        radius: radius / 2,
      });
      break;

    case "triangle":
      shape.set({
        width: currentPoint.x - (shape.left || 0),
        height: currentPoint.y - (shape.top || 0),
      });
      break;

    default:
      break;
  }
}
