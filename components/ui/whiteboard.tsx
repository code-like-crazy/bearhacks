"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Eraser, Pencil, Square } from "lucide-react";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TravelPlans from "./TravelPlans";

type Shape = {
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
};

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<
    "pencil" | "rectangle" | "circle" | "eraser"
  >("pencil");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Track dragging state

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        setContext(ctx);
      }
    }
  }, []);

  useEffect(() => {
    if (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      shapes.forEach((shape) => drawShape(shape));
      if (currentShape) {
        // Draw the current shape being dragged
        drawShape(currentShape);
      }
    }
  }, [shapes, context, currentShape]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil" || tool === "eraser") {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    } else if (tool === "rectangle" || tool === "circle") {
      const newShape: Shape = {
        type: tool,
        x: offsetX,
        y: offsetY,
        color: "transparent", // Start with a transparent shape
      };
      setCurrentShape(newShape);
      setIsDragging(true); // Start dragging
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing && (tool === "pencil" || tool === "eraser")) {
      context.lineTo(offsetX, offsetY);
      context.strokeStyle = tool === "eraser" ? "white" : "black";
      context.lineWidth = tool === "eraser" ? 10 : 2;
      context.stroke();
    } else if (currentShape && isDragging) {
      // Only update shape if dragging
      const updatedShape = { ...currentShape };
      if (tool === "rectangle") {
        updatedShape.width = offsetX - currentShape.x;
        updatedShape.height = offsetY - currentShape.y;
      } else if (tool === "circle") {
        updatedShape.radius = Math.sqrt(
          Math.pow(offsetX - currentShape.x, 2) +
            Math.pow(offsetY - currentShape.y, 2),
        );
      }
      setCurrentShape(updatedShape);
    }
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (context) {
        context.closePath();
      }
    }
    if (currentShape) {
      setShapes([...shapes, currentShape]);
      setCurrentShape(null);
      setIsDragging(false); // Stop dragging
    }
  };

  const drawShape = (shape: Shape) => {
    if (!context) return;
    if (shape.type === "rectangle" && shape.width && shape.height) {
      context.strokeStyle = "black"; // Border color
      context.lineWidth = 2; // Border width
      context.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle" && shape.radius) {
      context.strokeStyle = "black"; // Border color
      context.lineWidth = 2; // Border width
      context.beginPath();
      context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      context.stroke();
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col items-center">
          <div className="mb-4 flex justify-center space-x-2">
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => setTool("pencil")}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Pencil
            </button>
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => setTool("rectangle")}
            >
              <Square className="mr-2 h-4 w-4" />
              Rectangle
            </button>
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => setTool("circle")}
            >
              <Circle className="mr-2 h-4 w-4" />
              Circle
            </button>
            <button
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => setTool("eraser")}
            >
              <Eraser className="mr-2 h-4 w-4" />
              Eraser
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-black bg-white"
            style={{ cursor: tool === "eraser" ? "crosshair" : "default" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
          />
        </div>
        <TravelPlans />
      </div>
      <div className="mt-4">
        <img
          src="https://via.placeholder.com/300x200"
          alt="Mountains"
          className="mb-2"
        />
        <p>Hotels $200 per night</p>
      </div>
      <div className="mt-4">
        <img
          src="https://via.placeholder.com/200x150"
          alt="Night Activity"
          className="mb-2"
        />
      </div>
      <div className="mt-4">
        <label htmlFor="budget">Budget:</label>
        <input
          type="range"
          id="budget"
          name="budget"
          min="0"
          max="1000"
          step="50"
        />
      </div>
    </div>
  );
};

export default Whiteboard;
