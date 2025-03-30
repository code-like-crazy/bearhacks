"use client";

import React, { useCallback, useRef, useState } from "react"; // Import React

import { Camera, Trash2, Upload } from "lucide-react"; // Added Camera and Upload icons

import type { ToolType } from "@/lib/types";
import { Popover, PopoverContent } from "@/components/ui/popover"; // Import Popover

import DrawingCanvas from "./elements/drawing-canvas";
import ImageElement from "./elements/image-element";
import ShapeElement from "./elements/shape-element";
import StampElement from "./elements/stamp-element";
import StickyNoteElement from "./elements/sticky-note";
import TextElement from "./elements/text-element";

interface CanvasProps {
  scale: number;
  position: { x: number; y: number };
  activeTool: ToolType;
  isDragging: boolean; // This prop might indicate panning/zooming, separate from element dragging
  currentColor: string;
}

export interface CanvasElement {
  id: string;
  type: "sticky" | "image" | "text" | "drawing" | "stamp" | "shape";
  position: { x: number; y: number };
  content: any;
  zIndex: number;
}

type Point = { x: number; y: number };

export default function Canvas({
  scale,
  position,
  activeTool,
  isDragging,
  currentColor,
}: CanvasProps) {
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
  ]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextZIndex, setNextZIndex] = useState(3);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentShape, setCurrentShape] = useState<
    "square" | "circle" | "triangle" | "diamond"
  >("square");
  const [isDrawing, setIsDrawing] = useState(false); // For pencil tool
  const [startShapePosition, setStartShapePosition] = useState<Point | null>(
    null,
  ); // For shape tool
  const [currentShapeSize, setCurrentShapeSize] = useState<number>(50);
  const [isShapeDragging, setIsShapeDragging] = useState(false); // For shape tool preview
  const [currentShapeType, setCurrentShapeType] = useState<
    "square" | "circle" | "triangle" | "diamond"
  >("square");
  const [shapePreview, setShapePreview] = useState<CanvasElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [isCursorPreviewVisible, setIsCursorPreviewVisible] = useState(false);
  const [shapeStyle, setShapeStyle] = useState<React.CSSProperties>({
    width: 50,
    height: 50,
    border: `2px dashed ${currentColor}`,
    position: "absolute",
    left: -1000, // Start off-screen
    top: -1000, // Start off-screen
    pointerEvents: "none",
  });

  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);

  // State for image upload/placement flow
  const [showImageChoiceDialog, setShowImageChoiceDialog] = useState(false);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [isPlacingImage, setIsPlacingImage] = useState(false);
  const [pointerDownPos, setPointerDownPos] = useState<Point | null>(null); // Track pointer down position for click detection
  const [imageDialogPosition, setImageDialogPosition] = useState<Point | null>(
    null,
  ); // Position for the image choice popover

  // Helper to get coordinates from Mouse or Touch events relative to the canvas
  const getCoordinatesFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Point | null => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in e) {
        // Touch event
        if (e.touches.length === 0) return null; // No touch points
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = (clientX - rect.left - position.x) / scale;
      const y = (clientY - rect.top - position.y) / scale;
      return { x, y };
    },
    [scale, position.x, position.y],
  );

  // --- Add Element Functions (defined before use in handlePointerUp) ---
  const addStickyNote = useCallback(
    (x: number, y: number) => {
      const newSticky: CanvasElement = {
        id: `sticky-${Date.now()}`,
        type: "sticky",
        position: { x, y },
        content: { text: "New note...", color: currentColor, author: "You" },
        zIndex: nextZIndex,
      };
      setElements((prev) => [...prev, newSticky]);
      setNextZIndex((prev) => prev + 1);
      setSelectedElement(newSticky.id);
    },
    [currentColor, nextZIndex, setElements, setNextZIndex, setSelectedElement],
  );

  const addTextElement = useCallback(
    (x: number, y: number) => {
      const newText: CanvasElement = {
        id: `text-${Date.now()}`,
        type: "text",
        position: { x, y },
        content: { text: "Click to edit text", fontSize: 16, color: "#000000" },
        zIndex: nextZIndex,
      };
      setElements((prev) => [...prev, newText]);
      setNextZIndex((prev) => prev + 1);
      setSelectedElement(newText.id);
    },
    [nextZIndex, setElements, setNextZIndex, setSelectedElement],
  );

  const addStampElement = useCallback(
    (x: number, y: number) => {
      const stamps = ["❤️", "👍", "⭐", "✅", "🔥"];
      const randomStamp = stamps[Math.floor(Math.random() * stamps.length)];
      const newStamp: CanvasElement = {
        id: `stamp-${Date.now()}`,
        type: "stamp",
        position: { x, y },
        content: { emoji: randomStamp, size: 32 },
        zIndex: nextZIndex,
      };
      setElements((prev) => [...prev, newStamp]);
      setNextZIndex((prev) => prev + 1);
      setSelectedElement(newStamp.id);
    },
    [nextZIndex, setElements, setNextZIndex, setSelectedElement],
  );

  // --- Image Placement (defined before use in handlePointerUp) ---
  const placePendingImage = useCallback(
    (point: Point) => {
      if (!pendingImageSrc) return;

      const newImage: CanvasElement = {
        id: `image-${Date.now()}`,
        type: "image",
        position: point, // Use the click position for placement
        content: {
          src: pendingImageSrc,
          alt: "Uploaded image", // Consider getting filename if needed
        },
        zIndex: nextZIndex,
      };
      setElements((prev) => [...prev, newImage]);
      setNextZIndex((prev) => prev + 1);
      setSelectedElement(newImage.id);

      // Reset placement state
      setPendingImageSrc(null);
      setIsPlacingImage(false);
    },
    [
      pendingImageSrc,
      nextZIndex,
      setElements,
      setNextZIndex,
      setSelectedElement,
      setPendingImageSrc,
      setIsPlacingImage,
    ],
  );

  // --- Drawing Logic ---
  const startDrawing = useCallback((point: Point) => {
    setIsDrawing(true);
    setCurrentPath([point]); // Start new path
  }, []);

  const draw = useCallback(
    (point: Point) => {
      if (!isDrawing) return;
      setCurrentPath((prevPath) => [...prevPath, point]);
    },
    [isDrawing],
  );

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
  const startShape = useCallback(
    (point: Point) => {
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
    },
    [currentColor],
  );

  const updateShapePreview = useCallback(
    (point: Point) => {
      if (!isShapeDragging || !startShapePosition) return;
      const size = Math.max(
        Math.abs(point.x - startShapePosition.x),
        Math.abs(point.y - startShapePosition.y),
      );
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
    },
    [isShapeDragging, startShapePosition, currentColor],
  );

  const endShape = useCallback(() => {
    if (!isShapeDragging || !startShapePosition) return;

    // Use the calculated size
    if (currentShapeSize > 5) {
      // Add a threshold to avoid tiny shapes on click
      const topLeft = {
        x: Math.min(
          cursorPosition?.x ?? startShapePosition.x,
          startShapePosition.x,
        ),
        y: Math.min(
          cursorPosition?.y ?? startShapePosition.y,
          startShapePosition.y,
        ),
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
    setShapeStyle({
      // Hide preview
      width: 50,
      height: 50,
      border: `2px dashed ${currentColor}`,
      position: "absolute",
      left: -1000,
      top: -1000,
      pointerEvents: "none",
    });
  }, [
    isShapeDragging,
    startShapePosition,
    cursorPosition,
    currentShapeType,
    currentColor,
    currentShapeSize,
    nextZIndex,
  ]);

  // --- Event Handlers ---
  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Prevent default touch behavior like scrolling
      if ("touches" in e) {
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
      // Store pointer down position for click detection later
      setPointerDownPos(point);

      // Show image dialog immediately if camera tool is active on pointer down
      // if (activeTool === "camera") {
      //     setImageDialogPosition(point); // Store position for the popover
      //     setShowImageChoiceDialog(true);
      //     return; // Don't start drawing/shaping if camera tool is active
      // }

      // Start drawing or shaping
      if (activeTool === "pencil") {
        startDrawing(point);
      } else if (activeTool.startsWith("shape-")) {
        startShape(point);
      }
      // Add other tool start logic here (e.g., grab)
    },
    [
      activeTool,
      getCoordinatesFromEvent,
      startDrawing,
      startShape,
      isDragging,
      setShowImageChoiceDialog,
      setPointerDownPos,
      setImageDialogPosition,
    ],
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const point = getCoordinatesFromEvent(e);
      if (!point) return;
      setCursorPosition(point); // Update general cursor position

      if (activeTool === "pencil") {
        draw(point);
      } else if (activeTool.startsWith("shape-")) {
        updateShapePreview(point);
      }
      // Add other tool move logic here (e.g., grab)
    },
    [
      activeTool,
      getCoordinatesFromEvent,
      draw,
      updateShapePreview,
      setCursorPosition,
    ],
  ); // Added setCursorPosition dependency

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      // Add event parameter 'e'
      const endPoint = getCoordinatesFromEvent(e); // Get coords from the Up event

      // Determine if it was a click or drag based on distance from pointerDownPos
      let isClick = false;
      // Check if pointerDownPos exists before calculating distance
      if (pointerDownPos && endPoint) {
        const dx = endPoint.x - pointerDownPos.x;
        const dy = endPoint.y - pointerDownPos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 5) {
          // Click threshold
          isClick = true;
        }
      } else if (!isDrawing && !isShapeDragging && endPoint) {
        // If not drawing/shaping, and we have an endpoint, consider it a click
        // This handles cases where pointerDown might not have registered correctly but Up did
        isClick = true;
      }

      // Handle actions based on whether it was a click or the end of a drag
      if (isClick && endPoint) {
        // --- Click Actions ---
        if (isPlacingImage) {
          placePendingImage(endPoint); // Place image at the precise click location
        } else {
          // Handle other tool clicks (excluding camera, which is handled on PointerDown)
          switch (activeTool) {
            case "sticky":
              addStickyNote(endPoint.x, endPoint.y);
              break;
            case "text":
              addTextElement(endPoint.x, endPoint.y);
              break;
            case "stamp":
              addStampElement(endPoint.x, endPoint.y);
              break;
            case "select":
              setSelectedElement(null); // Deselect on canvas click
              break;
            // No default needed, other tools handled by drag or PointerDown
          }
        }
      } else {
        // --- Drag End Actions ---
        if (activeTool === "pencil" && isDrawing) {
          endDrawing();
        } else if (activeTool.startsWith("shape-") && isShapeDragging) {
          endShape();
        }
      }

      // Reset states after the action is complete
      setPointerDownPos(null); // Reset start position tracker
      // Explicitly reset drawing/shaping states if they were active
      if (isDrawing) setIsDrawing(false);
      if (isShapeDragging) setIsShapeDragging(false);
    },
    [
      activeTool,
      endDrawing,
      endShape,
      isPlacingImage,
      placePendingImage,
      addStickyNote,
      addTextElement,
      addStampElement,
      pointerDownPos,
      getCoordinatesFromEvent,
      isDrawing,
      isShapeDragging,
      setSelectedElement, // Added setSelectedElement
      setPointerDownPos,
      setIsDrawing,
      setIsShapeDragging, // Added state setters
    ],
  );

  // --- Element Specific Handlers ---
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

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileChange triggered"); // Log: Start
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) {
      console.log("handleFileChange: No file or canvas ref"); // Log: Exit condition
      return;
    }
    console.log("handleFileChange: File selected:", file.name); // Log: File info
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log("reader.onload triggered"); // Log: Reader loaded
      if (event.target?.result) {
        console.log("reader.onload: Result found, setting state..."); // Log: Success path
        setPendingImageSrc(event.target.result as string);
        setIsPlacingImage(true);
        setShowImageChoiceDialog(false); // Close dialog/popover
      } else {
        console.log("reader.onload: No result found"); // Log: Failure path
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error); // Log: Reader error
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset file input
  };

  // --- Element Management (remains the same) ---
  const bringToFront = (id: string) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, zIndex: nextZIndex } : el)),
    );
    setNextZIndex((prev) => prev + 1);
    setSelectedElement(id);
  };

  const updateElementContent = (id: string, newContent: any) => {
    setElements(
      elements.map((el) =>
        el.id === id
          ? { ...el, content: { ...el.content, ...newContent } }
          : el,
      ),
    );
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedElement(null);
  };

  const updateElementPosition = (id: string, newPosition: Point) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, position: newPosition } : el,
      ),
    );
  };

  return (
    <div
      ref={canvasRef}
      className="absolute h-[5000px] w-[5000px] touch-none bg-white" // Added touch-none to prevent browser default touch actions
      style={{
        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        transformOrigin: "0 0",
        cursor: isPlacingImage
          ? "copy"
          : activeTool === "pencil"
            ? "crosshair"
            : activeTool === "eraser"
              ? "not-allowed"
              : "default",
      }}
      // onClick removed, logic consolidated into onPointerUp
      // Pointer events handle both mouse and touch
      onPointerDown={handlePointerDown} // Pass the memoized handler directly
      onPointerMove={handlePointerMove} // Pass the memoized handler directly
      onPointerUp={handlePointerUp} // Pass the memoized handler directly
      onPointerLeave={handlePointerUp} // Treat leaving the area as pointer up
    >
      {/* Image Choice Popover */}
      <Popover
        open={showImageChoiceDialog}
        onOpenChange={setShowImageChoiceDialog}
      >
        {/* No PopoverTrigger needed, opened programmatically */}
        <PopoverContent
          className="w-auto rounded-lg border bg-white p-2 shadow-lg"
          style={
            imageDialogPosition
              ? {
                  position: "absolute",
                  left: `${imageDialogPosition.x}px`,
                  top: `${imageDialogPosition.y}px`,
                  transform: "translate(10px, 10px)", // Offset slightly from cursor
                  zIndex: 50, // Ensure it's above canvas elements
                }
              : { display: "none" }
          }
          // Prevent popover content from triggering canvas events
          onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
          // onClick={(e: React.MouseEvent) => e.stopPropagation()} // Remove general onClick stopPropagation from content div
        >
          <div className="flex flex-col space-y-2">
            {/* Use label to trigger file input */}
            <label
              htmlFor="file-upload-input" // Associate label with input ID
              className="flex w-full cursor-pointer items-center justify-start rounded px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
              // Stop propagation on label click as well
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Photo
            </label>
            <button
              className="flex w-full items-center justify-start rounded px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
              onClick={() => {
                // TODO: Implement "Take Photo" functionality
                console.log(
                  "Take Photo clicked - functionality not implemented",
                );
                setShowImageChoiceDialog(false); // Close popover
              }}
            >
              <Camera className="mr-2 h-4 w-4" /> Take Photo
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Image Placement Prompt */}
      {isPlacingImage && cursorPosition && (
        <div
          className="pointer-events-none absolute rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white"
          style={{
            left: `${cursorPosition.x + 15}px`, // Offset from cursor
            top: `${cursorPosition.y + 15}px`, // Offset from cursor
            zIndex: 9999, // Ensure it's on top
          }}
        >
          Click to place image
        </div>
      )}

      {/* Shape Preview (Visible during shape drag) */}
      {isShapeDragging && startShapePosition && <div style={shapeStyle} />}

      {/* Hidden file input for image upload - Added ID */}
      <input
        id="file-upload-input" // Added ID for label association
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Current drawing path (Live preview) */}
      {isDrawing && currentPath.length > 1 && (
        <svg className="pointer-events-none absolute top-0 left-0 h-full w-full">
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
        const isSelected = selectedElement === element.id;
        // Base style, position is handled differently for drawing
        const baseStyle = {
          position: "absolute" as const,
          zIndex: element.zIndex,
        };
        // Specific style for non-drawing elements, applying position
        const elementStyle =
          element.type !== "drawing"
            ? {
                ...baseStyle,
                left: `${element.position.x}px`,
                top: `${element.position.y}px`,
              }
            : baseStyle; // DrawingCanvas calculates its own position

        // Delete button for selected element
        const deleteButton =
          isSelected && activeTool === "select" ? (
            <button
              key={`${element.id}-delete`} // Ensure unique key
              className="absolute -top-4 -right-4 z-50 rounded-full bg-red-500 p-1 text-white shadow-md" // Higher z-index
              onPointerDown={(e) => {
                // Use onPointerDown
                e.stopPropagation();
                deleteElement(element.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null;

        // Wrapper div for positioning and event handling
        const wrapperStyle =
          element.type === "drawing" ? baseStyle : elementStyle;

        return (
          <div
            key={element.id}
            className="relative"
            style={wrapperStyle}
            onPointerDown={(e) => handleElementPointerDown(e, element.id)}
          >
            {deleteButton}
            {(() => {
              switch (element.type) {
                case "sticky":
                  return (
                    <StickyNoteElement
                      id={element.id}
                      style={elementStyle}
                      content={element.content}
                      isSelected={isSelected}
                      onBringToFront={() => bringToFront(element.id)}
                      onPositionChange={(newPos) =>
                        updateElementPosition(element.id, newPos)
                      }
                      onContentChange={(newContent) =>
                        updateElementContent(element.id, newContent)
                      }
                      canDrag={activeTool === "select"}
                    />
                  );
                case "image":
                  return (
                    <ImageElement
                      id={element.id}
                      style={elementStyle}
                      content={element.content}
                      isSelected={isSelected}
                      onBringToFront={() => bringToFront(element.id)}
                      onPositionChange={(newPos) =>
                        updateElementPosition(element.id, newPos)
                      }
                      canDrag={activeTool === "select"}
                    />
                  );
                case "text":
                  return (
                    <TextElement
                      id={element.id}
                      style={elementStyle}
                      content={element.content}
                      isSelected={isSelected}
                      onBringToFront={() => bringToFront(element.id)}
                      onPositionChange={(newPos) =>
                        updateElementPosition(element.id, newPos)
                      }
                      onContentChange={(newContent) =>
                        updateElementContent(element.id, newContent)
                      }
                      canDrag={activeTool === "select"}
                    />
                  );
                case "drawing":
                  // Pass baseStyle as DrawingCanvas handles its own positioning via SVG coords
                  return (
                    <DrawingCanvas
                      id={element.id}
                      style={baseStyle}
                      content={element.content}
                      isSelected={isSelected}
                    />
                  );
                case "stamp":
                  return (
                    <StampElement
                      id={element.id}
                      style={elementStyle}
                      content={element.content}
                      isSelected={isSelected}
                      onBringToFront={() => bringToFront(element.id)}
                      onPositionChange={(newPos) =>
                        updateElementPosition(element.id, newPos)
                      }
                      canDrag={activeTool === "select"}
                    />
                  );
                case "shape":
                  return (
                    <ShapeElement
                      id={element.id}
                      style={elementStyle}
                      content={element.content}
                      isSelected={isSelected}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </div>
        );
      })}
    </div>
  );
}
