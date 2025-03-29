"use client"

import type React from "react"

import { useRef, useState } from "react"
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
  isDragging: boolean
  currentColor: string
}

export interface CanvasElement {
  id: string
  type: "sticky" | "image" | "text" | "drawing" | "stamp" | "shape"
  position: { x: number; y: number }
  content: any
  zIndex: number
}

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
  const [isDrawing, setIsDrawing] = useState(false)
  const [startShapePosition, setStartShapePosition] = useState<{ x: number; y: number } | null>(null)
  const [currentShapeSize, setCurrentShapeSize] = useState<number>(50)
  const [isShapeDragging, setIsShapeDragging] = useState(false)
  const [currentShapeType, setCurrentShapeType] = useState<"square" | "circle" | "triangle" | "diamond">("square")
  const [shapePreview, setShapePreview] = useState<CanvasElement | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
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

  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;

    setCursorPosition({ x, y });

    if (activeTool.startsWith("shape-") && isShapeDragging && startShapePosition) {
      const size = Math.max(Math.abs(x - startShapePosition.x), Math.abs(y - startShapePosition.y));
      setCurrentShapeSize(size);
      setShapeStyle({
        width: size,
        height: size,
        border: `2px dashed ${currentColor}`,
        position: "absolute",
        left: startShapePosition.x < x ? startShapePosition.x : x - size,
        top: startShapePosition.y < y ? startShapePosition.y : y - size,
        pointerEvents: "none",
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;

    if (activeTool === "sticky") {
      addStickyNote(x, y);
    } else if (activeTool === "camera") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else if (activeTool === "text") {
      addTextElement(x, y);
    } else if (activeTool === "stamp") {
      addStampElement(x, y);
    } else if (activeTool === "eraser") {
      // Handled by element click
    } else if (activeTool === "select") {
      // Deselect when clicking on empty canvas
      setSelectedElement(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;

    if (activeTool.startsWith("shape-")) {
      setStartShapePosition({ x, y });
      setIsShapeDragging(true);
      setShapeStyle({
        width: currentShapeSize,
        height: currentShapeSize,
        border: `2px dashed ${currentColor}`,
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
      });
    }
  };

  const handleMouseUp = () => {
    if (startShapePosition && cursorPosition && activeTool.startsWith("shape-")) {
      const shape = currentShapeType;
      const x = startShapePosition.x;
      const y = startShapePosition.y;
      addShapeElement(
        x,
        y,
        shape
      );
      setStartShapePosition(null);
      setIsShapeDragging(false);
      setShapeStyle({
        width: 50,
        height: 50,
        border: `2px dashed ${currentColor}`,
        position: "absolute",
        left: -1000,
        top: -1000,
        pointerEvents: "none",
      });
    }
  };

  const addShapeElement = (x: number, y: number, shape: "square" | "circle" | "triangle" | "diamond") => {
    const newShape: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      position: { x, y },
      content: {
        shape: shape,
        color: currentColor,
        size: currentShapeSize,
      },
      zIndex: nextZIndex,
    };

    setElements([...elements, newShape]);
    setNextZIndex(nextZIndex + 1);
    setSelectedElement(newShape.id);
  };

  const updateElementPosition = (id: string, newPosition: { x: number; y: number }) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, position: newPosition } : el)));
  };

  const handleMouseMoveForDrawing = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - position.x) / scale
    const y = (e.clientY - rect.top - position.y) / scale

    setCurrentPath([...currentPath, { x, y }])
  }

  const handleMouseUpForDrawing = () => {
    if (isDrawing && currentPath.length > 1) {
      // Save the drawing
      const newDrawing: CanvasElement = {
        id: `drawing-${Date.now()}`,
        type: "drawing",
        position: { x: 0, y: 0 },
        content: {
          path: currentPath,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
        },
        zIndex: nextZIndex,
      }

      setElements([...elements, newDrawing])
      setNextZIndex(nextZIndex + 1)
    }

    setIsDrawing(false)
    setCurrentPath([])
  }

  // Add a sticky note
  const addStickyNote = (x: number, y: number) => {
    const newSticky: CanvasElement = {
      id: `sticky-${Date.now()}`,
      type: "sticky",
      position: { x, y },
      content: {
        text: "New note...",
        color: currentColor,
        author: "You",
      },
      zIndex: nextZIndex,
    }

    setElements([...elements, newSticky])
    setNextZIndex(nextZIndex + 1)
    setSelectedElement(newSticky.id)
  }

  // Add a text element
  const addTextElement = (x: number, y: number) => {
    const newText: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      position: { x, y },
      content: {
        text: "Click to edit text",
        fontSize: 16,
        color: "#000000",
      },
      zIndex: nextZIndex,
    }

    setElements([...elements, newText])
    setNextZIndex(nextZIndex + 1)
    setSelectedElement(newText.id)
  }

  // Add a stamp element
  const addStampElement = (x: number, y: number) => {
    const stamps = ["❤️", "👍", "⭐", "✅", "🔥"]
    const randomStamp = stamps[Math.floor(Math.random() * stamps.length)]

    const newStamp: CanvasElement = {
      id: `stamp-${Date.now()}`,
      type: "stamp",
      position: { x, y },
      content: {
        emoji: randomStamp,
        size: 32,
      },
      zIndex: nextZIndex,
    }

    setElements([...elements, newStamp])
    setNextZIndex(nextZIndex + 1)
    setSelectedElement(newStamp.id)
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canvasRef.current) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // Get center of visible canvas
        const rect = canvasRef.current!.getBoundingClientRect()
        const centerX = (window.innerWidth / 2 - rect.left - position.x) / scale
        const centerY = (window.innerHeight / 2 - position.y) / scale

        const newImage: CanvasElement = {
          id: `image-${Date.now()}`,
          type: "image",
          position: { x: centerX - 100, y: centerY - 100 },
          content: {
            src: event.target.result as string,
            alt: file.name,
            file: file,
          },
          zIndex: nextZIndex,
        }

        setElements([...elements, newImage])
        setNextZIndex(nextZIndex + 1)
        setSelectedElement(newImage.id)
      }
    }
    reader.readAsDataURL(file)

    // Reset file input
    e.target.value = ""
  }

  // Bring element to front
  const bringToFront = (id: string) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, zIndex: nextZIndex } : el)))
    setNextZIndex(nextZIndex + 1)
    setSelectedElement(id)
  }

  // Update element content
  const updateElementContent = (id: string, newContent: any) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, content: { ...el.content, ...newContent } } : el)))
  }

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    setSelectedElement(null)
  }

  // Handle element click
  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    if (activeTool === "eraser") {
      deleteElement(id)
    } else {
      setSelectedElement(id)
      bringToFront(id)
    }
  }

  return (
    <div
      ref={canvasRef}
      className="absolute h-[5000px] w-[5000px] bg-white"
      style={{
        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        transformOrigin: "0 0",
        cursor: activeTool === "pencil" ? "crosshair" : activeTool === "eraser" ? "not-allowed" : "default",
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Shape Preview */}
      <ShapeHandler
        activeTool={activeTool}
        currentColor={currentColor}
        scale={scale}
        position={position}
      />

      {/* Hidden file input for image upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Current drawing path */}
      {isDrawing && currentPath.length > 1 && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <path
            d={`M ${currentPath.map((p) => `${p.x},${p.y}`).join(" L ")}`}
            stroke={currentColor}
            strokeWidth={currentStrokeWidth}
            fill="none"
          />
        </svg>
      )}

      {/* Render all elements */}
      {elements.map((element) => {
        const isSelected = selectedElement === element.id
        const style = {
          position: "absolute" as const,
          left: `${element.position.x}px`,
          top: `${element.position.y}px`,
          zIndex: element.zIndex,
        }

        // Delete button for selected element
        const deleteButton =
          isSelected && activeTool === "select" ? (
            <button
              key={element.id}
              className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 shadow-md z-10"
              onClick={(e) => {
                e.stopPropagation()
                deleteElement(element.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null

        switch (element.type) {
          case "sticky":
            return (
              <div key={element.id} className="relative" onClick={(e) => handleElementClick(e, element.id)}>
                {deleteButton}
                <StickyNoteElement
                  id={element.id}
                  style={style}
                  content={element.content}
                  isSelected={isSelected}
                  onBringToFront={() => bringToFront(element.id)}
                  onPositionChange={(newPos) => updateElementPosition(element.id, newPos)}
                  onContentChange={(newContent) => updateElementContent(element.id, newContent)}
                  canDrag={activeTool === "select"}
                />
              </div>
            )
          case "image":
            return (
              <div key={element.id} className="relative" onClick={(e) => handleElementClick(e, element.id)}>
                {deleteButton}
                <ImageElement
                  id={element.id}
                  style={style}
                  content={element.content}
                  isSelected={isSelected}
                  onBringToFront={() => bringToFront(element.id)}
                  onPositionChange={(newPos) => updateElementPosition(element.id, newPos)}
                  canDrag={activeTool === "select"}
                />
              </div>
            )
          case "text":
            return (
              <div key={element.id} className="relative" onClick={(e) => handleElementClick(e, element.id)}>
                {deleteButton}
                <TextElement
                  id={element.id}
                  style={style}
                  content={element.content}
                  isSelected={isSelected}
                  onBringToFront={() => bringToFront(element.id)}
                  onPositionChange={(newPos) => updateElementPosition(element.id, newPos)}
                  onContentChange={(newContent) => updateElementContent(element.id, newContent)}
                  canDrag={activeTool === "select"}
                />
              </div>
            )
          case "drawing":
            return (
              <div key={element.id} className="relative" onClick={(e) => handleElementClick(e, element.id)}>
                {deleteButton}
                <DrawingCanvas id={element.id} style={style} content={element.content} isSelected={isSelected} />
              </div>
            )
          case "stamp":
            return (
              <div key={element.id} className="relative" onClick={(e) => handleElementClick(e, element.id)}>
                {deleteButton}
                <StampElement
                  id={element.id}
                  style={style}
                  content={element.content}
                  isSelected={isSelected}
                  onBringToFront={() => bringToFront(element.id)}
                  onPositionChange={(newPos) => updateElementPosition(element.id, newPos)}
                  canDrag={activeTool === "select"}
                />
              </div>
            )
          case "shape":
            return (
              <div key={element.id} className="relative" onClick={(e) => handleElementClick(e, element.id)}>
                {deleteButton}
                <ShapeElement
                  id={element.id}
                  style={style}
                  content={element.content}
                  isSelected={isSelected}
                />
              </div>
            )
          default:
            return null
        }
      })}
    </div >
  )
}
