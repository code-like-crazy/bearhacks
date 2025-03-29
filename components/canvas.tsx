"use client"

import type React from "react"
import { useRef, useState, useCallback } from "react" // Import useCallback
import type { ToolType } from "@/lib/types"
import StickyNoteElement from "./elements/sticky-note"
import ImageElement from "./elements/image-element"
import TextElement from "./elements/text-element"
import DrawingCanvas from "./elements/drawing-canvas"
import StampElement from "./elements/stamp-element"
import ShapeElement from "./elements/shape-element"
import ShapeHandler from "./shape-handler"
import { Trash2 } from "lucide-react"

interface CanvasProps {
  scale: number
  position: { x: number; y: number }
  activeTool: ToolType
  isDragging: boolean // This prop might indicate panning/zooming, separate from element dragging
  currentColor: string
}

export interface CanvasElement {
  id: string
  type: "sticky" | "image" | "text" | "drawing" | "stamp" | "shape"
  position: { x: number; y: number }
  content: any
  zIndex: number
}

type Point = { x: number; y: number };

export default function Canvas({ scale, position, activeTool, isDragging, currentColor }: CanvasProps) {
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: "sticky-1",
      type: "sticky",
      position: { x: 700, y: 200 },
      content: {
        text: "I want to go somewhere with nice nature.... A lot of extreme activities",
        color: "#FFC8F0",
        author: "Sarah Kim",
      },
      zIndex: 1,
    },
    {
      id: "image-1",
      type: "image",
      position: { x: 600, y: 400 },
      content: {
        src: "/placeholder.svg?height=200&width=200",
        alt: "Paragliding",
        caption: "Paragliding",
      },
      zIndex: 2,
    },
  ])

  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nextZIndex, setNextZIndex] = useState(3)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [currentShape, setCurrentShape] = useState<"square" | "circle" | "triangle" | "diamond">("square")
  const [isDrawing, setIsDrawing] = useState(false) // For pencil tool
  const [startShapePosition, setStartShapePosition] = useState<Point | null>(null) // For shape tool
  const [currentShapeSize, setCurrentShapeSize] = useState<number>(50)
  const [isShapeDragging, setIsShapeDragging] = useState(false) // For shape tool preview
  const [currentShapeType, setCurrentShapeType] = useState<"square" | "circle" | "triangle" | "diamond">("square")
  const [shapePreview, setShapePreview] = useState<CanvasElement | null>(null)
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null)
  const [isCursorPreviewVisible, setIsCursorPreviewVisible] = useState(false)
  const [shapeStyle, setShapeStyle] = useState<React.CSSProperties>({
    width: 50,
    height: 50,
    border: `2px dashed ${currentColor}`,
    position: "absolute",
    left: -1000,
    top: -1000,
    pointerEvents: "none",
  });

  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2)

  // Helper to get coordinates from Mouse or Touch events relative to the canvas
  const getCoordinatesFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) { // Touch event
      if (e.touches.length === 0) return null; // No touch points
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else { // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left - position.x) / scale;
    const y = (clientY - rect.top - position.y) / scale;
    return { x, y };
  }, [scale, position.x, position.y]);


  // --- Drawing Logic ---
  const startDrawing = useCallback((point: Point) => {
    setIsDrawing(true);
    setCurrentPath([point]); // Start new path
  }, []);

  const draw = useCallback((point: Point) => {
    if (!isDrawing) return;
    setCurrentPath((prevPath) => [...prevPath, point]);
  }, [isDrawing]);

  const endDrawing = useCallback(() => {
    if (!isDrawing) return; // Prevent ending if not drawing

    if (currentPath.length > 1) {
      const newDrawing: CanvasElement = {
        id: `drawing-${Date.now()}`,
        type: "drawing",
        position: { x: 0, y: 0 }, // Position handled by DrawingCanvas based on path
        content: {
          path: currentPath,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
        },
        zIndex: nextZIndex,
      };
      setElements((prev) => [...prev, newDrawing]);
      setNextZIndex((prev) => prev + 1);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, currentColor, currentStrokeWidth, nextZIndex]);

  // --- Shape Logic ---
   const startShape = useCallback((point: Point) => {
    setStartShapePosition(point);
    setIsShapeDragging(true);
    // Initial style set here, updated in move
    setShapeStyle({
        width: 0, // Start with zero size
        height: 0,
        border: `2px dashed ${currentColor}`,
        position: "absolute",
        left: point.x,
        top: point.y,
        pointerEvents: "none",
      });
  }, [currentColor]);

  const updateShapePreview = useCallback((point: Point) => {
     if (!isShapeDragging || !startShapePosition) return;
      const size = Math.max(Math.abs(point.x - startShapePosition.x), Math.abs(point.y - startShapePosition.y));
      setCurrentShapeSize(size); // Store the size if needed for the final element
      setShapeStyle({
        width: size,
        height: size,
        border: `2px dashed ${currentColor}`,
        position: "absolute",
        // Adjust left/top based on drag direction
        left: Math.min(point.x, startShapePosition.x),
        top: Math.min(point.y, startShapePosition.y),
        pointerEvents: "none",
      });
  }, [isShapeDragging, startShapePosition, currentColor]);

  const endShape = useCallback(() => {
    if (!isShapeDragging || !startShapePosition) return;

    // Use the calculated size
    if (currentShapeSize > 5) { // Add a threshold to avoid tiny shapes on click
        const topLeft = {
             x: Math.min(cursorPosition?.x ?? startShapePosition.x, startShapePosition.x),
             y: Math.min(cursorPosition?.y ?? startShapePosition.y, startShapePosition.y)
        };
        const newShape: CanvasElement = {
            id: `shape-${Date.now()}`,
            type: "shape",
            position: topLeft, // Use calculated top-left corner
            content: {
                shape: currentShapeType, // Make sure this is updated based on toolbar selection
                color: currentColor,
                size: currentShapeSize,
            },
            zIndex: nextZIndex,
        };
        setElements((prev) => [...prev, newShape]);
        setNextZIndex((prev) => prev + 1);
        setSelectedElement(newShape.id); // Optionally select the new shape
    }

    // Reset shape dragging state
    setStartShapePosition(null);
    setIsShapeDragging(false);
    setCurrentShapeSize(50); // Reset default size
    setShapeStyle({ // Hide preview
        width: 50, height: 50, border: `2px dashed ${currentColor}`,
        position: "absolute", left: -1000, top: -1000, pointerEvents: "none",
    });
  }, [isShapeDragging, startShapePosition, cursorPosition, currentShapeType, currentColor, currentShapeSize, nextZIndex]);


  // --- Event Handlers ---
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default touch behavior like scrolling
    if ('touches' in e) {
        // Allow default for multi-touch (pinch/zoom) gestures if implemented elsewhere
        if (e.touches.length === 1) {
             e.preventDefault();
        }
    }
    const point = getCoordinatesFromEvent(e);
    // Original check: Ignore if no point or if canvas is being dragged (panning/zooming)
    if (!point || isDragging) return;

    if (activeTool === "pencil") {
      startDrawing(point);
    } else if (activeTool.startsWith("shape-")) {
      startShape(point);
    }
    // Add other tool start logic here (e.g., grab)
  }, [activeTool, getCoordinatesFromEvent, startDrawing, startShape, isDragging]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const point = getCoordinatesFromEvent(e);
    if (!point) return;
    setCursorPosition(point); // Update general cursor position

    if (activeTool === "pencil") {
      draw(point);
    } else if (activeTool.startsWith("shape-")) {
      updateShapePreview(point);
    }
    // Add other tool move logic here (e.g., grab)
  }, [activeTool, getCoordinatesFromEvent, draw, updateShapePreview]);

  const handlePointerUp = useCallback(() => {
    if (activeTool === "pencil") {
      endDrawing();
    } else if (activeTool.startsWith("shape-")) {
      endShape();
    }
    // Add other tool end logic here (e.g., grab)
  }, [activeTool, endDrawing, endShape]);

  // --- Element Specific Handlers ---
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Keep for tools that activate on simple click (sticky, text, stamp)
    // Prevent activating these if a drag/draw just finished
    if (!canvasRef.current || isDragging || isDrawing || isShapeDragging || currentPath.length > 0 || startShapePosition) return;

    const point = getCoordinatesFromEvent(e);
    if (!point) return;

    if (activeTool === "sticky") addStickyNote(point.x, point.y);
    else if (activeTool === "camera") fileInputRef.current?.click();
    else if (activeTool === "text") addTextElement(point.x, point.y);
    else if (activeTool === "stamp") addStampElement(point.x, point.y);
    else if (activeTool === "select") setSelectedElement(null); // Deselect on canvas click
  };

  const handleElementPointerDown = (e: React.PointerEvent, id: string) => {
     // Use PointerEvent for consistency
    e.stopPropagation(); // Prevent canvas pointer down handler

    if (activeTool === "eraser") {
      deleteElement(id);
    } else if (activeTool === "select") {
      setSelectedElement(id);
      bringToFront(id);
      // Add logic here to initiate element dragging if needed
    }
    // Add grab tool logic here if elements should be grabbable
  };

  // --- Add Element Functions ---
  const addStickyNote = (x: number, y: number) => {
    const newSticky: CanvasElement = { id: `sticky-${Date.now()}`, type: "sticky", position: { x, y }, content: { text: "New note...", color: currentColor, author: "You" }, zIndex: nextZIndex };
    setElements((prev) => [...prev, newSticky]);
    setNextZIndex((prev) => prev + 1);
    setSelectedElement(newSticky.id);
  };

  const addTextElement = (x: number, y: number) => {
    const newText: CanvasElement = { id: `text-${Date.now()}`, type: "text", position: { x, y }, content: { text: "Click to edit text", fontSize: 16, color: "#000000" }, zIndex: nextZIndex };
    setElements((prev) => [...prev, newText]);
    setNextZIndex((prev) => prev + 1);
    setSelectedElement(newText.id);
  };

  const addStampElement = (x: number, y: number) => {
    const stamps = ["❤️", "👍", "⭐", "✅", "🔥"];
    const randomStamp = stamps[Math.floor(Math.random() * stamps.length)];
    const newStamp: CanvasElement = { id: `stamp-${Date.now()}`, type: "stamp", position: { x, y }, content: { emoji: randomStamp, size: 32 }, zIndex: nextZIndex };
    setElements((prev) => [...prev, newStamp]);
    setNextZIndex((prev) => prev + 1);
    setSelectedElement(newStamp.id);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const centerX = (window.innerWidth / 2 - rect.left - position.x) / scale;
        const centerY = (window.innerHeight / 2 - position.y) / scale;
        const newImage: CanvasElement = { id: `image-${Date.now()}`, type: "image", position: { x: centerX - 100, y: centerY - 100 }, content: { src: event.target.result as string, alt: file.name, file: file }, zIndex: nextZIndex };
        setElements((prev) => [...prev, newImage]);
        setNextZIndex((prev) => prev + 1);
        setSelectedElement(newImage.id);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset file input
  };

  // --- Element Management ---
  const bringToFront = (id: string) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, zIndex: nextZIndex } : el)));
    setNextZIndex((prev) => prev + 1);
    setSelectedElement(id);
  };

  const updateElementContent = (id: string, newContent: any) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, content: { ...el.content, ...newContent } } : el)));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedElement(null);
  };

  const updateElementPosition = (id: string, newPosition: Point) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, position: newPosition } : el)));
  };


  return (
    <div
      ref={canvasRef}
      className="absolute h-[5000px] w-[5000px] bg-white touch-none" // Added touch-none to prevent browser default touch actions
      style={{
        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        transformOrigin: "0 0",
        cursor: activeTool === "pencil" ? "crosshair" : activeTool === "eraser" ? "not-allowed" : "default",
      }}
      onClick={handleCanvasClick} // Keep for simple click tools
      // Pointer events handle both mouse and touch
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp} // Treat leaving the area as pointer up
    >
      {/* Shape Preview (Visible during shape drag) */}
       {isShapeDragging && startShapePosition && (
         <div style={shapeStyle} />
       )}

      {/* Hidden file input for image upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Current drawing path (Live preview) */}
      {isDrawing && currentPath.length > 1 && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <path
            d={`M ${currentPath.map((p) => `${p.x},${p.y}`).join(" L ")}`}
            stroke={currentColor}
            strokeWidth={currentStrokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Render all finalized elements */}
      {elements.map((element) => {
        const isSelected = selectedElement === element.id
        // Base style, position is handled differently for drawing
        const baseStyle = {
          position: "absolute" as const,
          zIndex: element.zIndex,
        }
        // Specific style for non-drawing elements, applying position
        const elementStyle = element.type !== 'drawing' ? {
            ...baseStyle,
            left: `${element.position.x}px`,
            top: `${element.position.y}px`,
        } : baseStyle; // DrawingCanvas calculates its own position

        // Delete button for selected element
        const deleteButton =
          isSelected && activeTool === "select" ? (
            <button
              key={`${element.id}-delete`} // Ensure unique key
              className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 shadow-md z-50" // Higher z-index
              onPointerDown={(e) => { // Use onPointerDown
                e.stopPropagation();
                deleteElement(element.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null

        // Wrapper div for positioning and event handling
        const wrapperStyle = element.type === 'drawing' ? baseStyle : elementStyle;

        return (
            <div key={element.id} className="relative" style={wrapperStyle} onPointerDown={(e) => handleElementPointerDown(e, element.id)}>
                 {deleteButton}
                 {(() => {
                    switch (element.type) {
                        case "sticky":
                            return <StickyNoteElement id={element.id} style={elementStyle} content={element.content} isSelected={isSelected} onBringToFront={() => bringToFront(element.id)} onPositionChange={(newPos) => updateElementPosition(element.id, newPos)} onContentChange={(newContent) => updateElementContent(element.id, newContent)} canDrag={activeTool === "select"} />;
                        case "image":
                            return <ImageElement id={element.id} style={elementStyle} content={element.content} isSelected={isSelected} onBringToFront={() => bringToFront(element.id)} onPositionChange={(newPos) => updateElementPosition(element.id, newPos)} canDrag={activeTool === "select"} />;
                        case "text":
                            return <TextElement id={element.id} style={elementStyle} content={element.content} isSelected={isSelected} onBringToFront={() => bringToFront(element.id)} onPositionChange={(newPos) => updateElementPosition(element.id, newPos)} onContentChange={(newContent) => updateElementContent(element.id, newContent)} canDrag={activeTool === "select"} />;
                        case "drawing":
                            // Pass baseStyle as DrawingCanvas handles its own positioning via SVG coords
                            return <DrawingCanvas id={element.id} style={baseStyle} content={element.content} isSelected={isSelected} />;
                        case "stamp":
                            return <StampElement id={element.id} style={elementStyle} content={element.content} isSelected={isSelected} onBringToFront={() => bringToFront(element.id)} onPositionChange={(newPos) => updateElementPosition(element.id, newPos)} canDrag={activeTool === "select"} />;
                        case "shape":
                            return <ShapeElement id={element.id} style={elementStyle} content={element.content} isSelected={isSelected} />;
                        default:
                            return null;
                    }
                 })()}
            </div>
        )
      })}
    </div >
  )
}
