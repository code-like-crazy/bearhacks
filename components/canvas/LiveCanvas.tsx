"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { nanoid } from "nanoid";

import { useMutation, useOthers, useStorage } from "@/lib/liveblocks.config";
import { CursorOverlay } from "@/components/canvas/CursorOverlay";

import { LiveCanvasProps } from "./types";

export default function LiveCanvas({
  boardId,
  activeTool,
  currentColor,
  scale = 1,
  position = { x: 0, y: 0 },
  setActiveTool,
}: LiveCanvasProps) {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [isDown, setIsDown] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentShape, setCurrentShape] = useState<fabric.Object | null>(null);

  // Liveblocks hooks
  const others = useOthers();

  // Get canvas objects from Liveblocks storage
  const canvasObjects = useStorage((root) => root.canvasObjects);

  // Mutations for updating storage
  const syncObjectToStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    // Generate an ID if it doesn't exist
    if (!(object as any).objectId) {
      (object as any).objectId = nanoid();
    }

    const objectId = (object as any).objectId;
    const objectData = object.toJSON();
    objectData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, objectData);
  }, []);

  const deleteObjectFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (canvas) return;
    if (!canvasRef.current) return;

    // Get the parent container dimensions
    const parentWidth =
      canvasRef.current.parentElement?.clientWidth || window.innerWidth - 300;
    const parentHeight = window.innerHeight - 161; // Adjust for header and toolbar

    const c = new fabric.Canvas("canvas", {
      height: parentHeight,
      width: parentWidth,
      backgroundColor: "#f3f4f6", // Light gray background
    });

    // Create grid pattern for background
    const gridSize = 25;
    const gridColor = "rgba(200, 200, 200, 0.2)";

    // Create grid as background image
    const gridCanvas = document.createElement("canvas");
    gridCanvas.width = gridSize;
    gridCanvas.height = gridSize;

    const gridCtx = gridCanvas.getContext("2d");
    if (gridCtx) {
      // Draw vertical line
      gridCtx.beginPath();
      gridCtx.moveTo(gridSize, 0);
      gridCtx.lineTo(gridSize, gridSize);
      gridCtx.strokeStyle = gridColor;
      gridCtx.stroke();

      // Draw horizontal line
      gridCtx.beginPath();
      gridCtx.moveTo(0, gridSize);
      gridCtx.lineTo(gridSize, gridSize);
      gridCtx.strokeStyle = gridColor;
      gridCtx.stroke();
    }

    // Create pattern and set as background
    const pattern = new fabric.Pattern({
      source: gridCanvas,
      repeat: "repeat",
    });

    // Add grid as a background image
    // Create a background overlay with the grid pattern
    const gridOverlay = new fabric.Rect({
      width: parentWidth,
      height: parentHeight,
      left: 0,
      top: 0,
      fill: pattern,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });

    // Add the grid overlay to the canvas
    c.add(gridOverlay);

    // Make sure the grid is at the back
    // We'll use a type assertion since the TypeScript definitions might be incomplete
    (gridOverlay as any).moveTo(0);
    c.renderAll();

    // Settings for all canvas in the app
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#2BEBC8";
    fabric.Object.prototype.cornerStyle = "rect";
    fabric.Object.prototype.cornerStrokeColor = "#2BEBC8";
    fabric.Object.prototype.cornerSize = 6;

    setCanvas(c);

    // Handle window resize
    const handleResize = () => {
      // Get updated parent container dimensions
      const parentWidth =
        canvasRef.current?.parentElement?.clientWidth ||
        window.innerWidth - 300;
      const parentHeight = window.innerHeight - 150;

      // Ensure canvas doesn't exceed parent container
      c.setDimensions({
        width: parentWidth,
        height: parentHeight,
      });
      c.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      c.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle keyboard events for deletion
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            if ((obj as any).objectId) {
              deleteObjectFromStorage((obj as any).objectId);
            }
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, deleteObjectFromStorage]);

  // Update canvas transform when scale or position changes
  useEffect(() => {
    if (!canvas) return;

    canvas.setZoom(scale);
    canvas.absolutePan(new fabric.Point(-position.x, -position.y));
    canvas.renderAll();
  }, [canvas, scale, position]);

  // Sync canvas objects from storage
  useEffect(() => {
    if (!canvas || !canvasObjects) return;

    // Clear existing objects that came from storage
    canvas.getObjects().forEach((obj) => {
      if ((obj as any)._fromStorage) {
        canvas.remove(obj);
      }
    });

    // Add objects from storage
    Array.from(canvasObjects.entries()).forEach(([objectId, objectData]) => {
      try {
        // @ts-ignore - Fabric types are not accurate for this method
        fabric.util.enlivenObjects([objectData], function (objects: any[]) {
          objects.forEach(function (obj: any) {
            obj.objectId = objectId;
            obj._fromStorage = true;
            canvas.add(obj);
          });
          canvas.renderAll();
        });
      } catch (error) {
        console.error("Error loading object from storage:", error);
      }
    });
  }, [canvas, canvasObjects]);

  // Handle mouse down on canvas
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (options: any) => {
      if (activeTool === "select") return;

      setIsDown(true);
      const pointer = canvas.getPointer(options.e);
      setStartPoint({ x: pointer.x, y: pointer.y });

      if (activeTool === "rectangle") {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: currentColor,
          selectable: false,
          strokeWidth: 0,
        });
        canvas.add(rect);
        setCurrentShape(rect);
      } else if (activeTool === "circle") {
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 0,
          fill: currentColor,
          selectable: false,
          strokeWidth: 0,
        });
        canvas.add(circle);
        setCurrentShape(circle);
      } else if (activeTool === "triangle") {
        const triangle = new fabric.Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: currentColor,
          selectable: false,
          strokeWidth: 0,
        });
        canvas.add(triangle);
        setCurrentShape(triangle);
      } else if (activeTool === "text") {
        const text = new fabric.Textbox("Edit this text", {
          left: pointer.x,
          top: pointer.y,
          fontFamily: "Arial",
          fill: currentColor,
          width: 200,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        setCurrentShape(null);
        setIsDown(false);
        syncObjectToStorage(text);

        // Auto-deselect tool after use
        if (setActiveTool) {
          setActiveTool("select");
        }
      } else if (activeTool === "sticky") {
        // Create a fabric sticky note
        const stickyWidth = 250;
        const stickyHeight = 180;

        // Create a sticky note directly
        const stickyNote = new fabric.Rect({
          width: stickyWidth,
          height: stickyHeight,
          left: pointer.x,
          top: pointer.y,
          fill: currentColor,
          rx: 5,
          ry: 5,
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.3)",
            blur: 5,
            offsetX: 0,
            offsetY: 2,
          }),
        });

        // Add the sticky note to canvas
        canvas.add(stickyNote);

        // Create editable text on top
        const textbox = new fabric.Textbox("Double-click to edit", {
          width: stickyWidth - 20,
          left: pointer.x + 10,
          top: pointer.y + 10,
          fontSize: 16,
          fontFamily: "Arial",
          fill: "#333333",
          editable: true,
        });

        // Create author text
        const authorText = new fabric.Text("User", {
          left: pointer.x + stickyWidth - 40,
          top: pointer.y + stickyHeight - 20,
          fontSize: 12,
          fontFamily: "Arial",
          fill: "#666666",
        });

        // Add text elements to canvas
        canvas.add(textbox);
        canvas.add(authorText);

        // Store positions for tracking movement
        const initialPositions = {
          note: { left: stickyNote.left || 0, top: stickyNote.top || 0 },
          text: { left: textbox.left || 0, top: textbox.top || 0 },
          author: { left: authorText.left || 0, top: authorText.top || 0 },
        };

        // Set up movement synchronization
        const moveAllElements = (opt: any) => {
          if (opt.target === stickyNote) {
            const dx = (stickyNote.left || 0) - initialPositions.note.left;
            const dy = (stickyNote.top || 0) - initialPositions.note.top;

            textbox.set({
              left: initialPositions.text.left + dx,
              top: initialPositions.text.top + dy,
            });

            authorText.set({
              left: initialPositions.author.left + dx,
              top: initialPositions.author.top + dy,
            });

            canvas.renderAll();
          }
        };

        // Add event listeners for synchronized movement
        canvas.on("object:moving", moveAllElements);

        // Add custom property to identify related elements
        const stickyId = nanoid();
        (stickyNote as any).stickyId = stickyId;
        (textbox as any).stickyId = stickyId;
        (authorText as any).stickyId = stickyId;

        // Sync to storage
        (stickyNote as any).objectId = `sticky-${stickyId}-bg`;
        (textbox as any).objectId = `sticky-${stickyId}-text`;
        (authorText as any).objectId = `sticky-${stickyId}-author`;

        syncObjectToStorage(stickyNote);
        syncObjectToStorage(textbox);
        syncObjectToStorage(authorText);

        // Add deletion handler to remove all related elements
        const handleObjectRemoved = (opt: any) => {
          if (opt.target && (opt.target as any).stickyId === stickyId) {
            const id = (opt.target as any).stickyId;
            canvas.getObjects().forEach((obj) => {
              if ((obj as any).stickyId === id && obj !== opt.target) {
                canvas.remove(obj);
                if ((obj as any).objectId) {
                  deleteObjectFromStorage((obj as any).objectId);
                }
              }
            });
          }
        };

        canvas.on("object:removed", handleObjectRemoved);

        // Switch back to select tool after adding sticky
        setIsDown(false);
        setStartPoint(null);

        // Auto-deselect tool after use
        if (setActiveTool) {
          setActiveTool("select");
        }
      }
    };

    const handleMouseMove = (options: any) => {
      if (!isDown || !startPoint || !currentShape) return;

      const pointer = canvas.getPointer(options.e);

      if (activeTool === "rectangle") {
        const width = Math.abs(pointer.x - startPoint.x);
        const height = Math.abs(pointer.y - startPoint.y);

        // Set the rectangle's position based on the start point and current point
        const left = pointer.x < startPoint.x ? pointer.x : startPoint.x;
        const top = pointer.y < startPoint.y ? pointer.y : startPoint.y;

        currentShape.set({
          left: left,
          top: top,
          width: width,
          height: height,
        });
      } else if (activeTool === "circle") {
        const radius =
          Math.sqrt(
            Math.pow(pointer.x - startPoint.x, 2) +
              Math.pow(pointer.y - startPoint.y, 2),
          ) / 2;

        const centerX = (pointer.x + startPoint.x) / 2;
        const centerY = (pointer.y + startPoint.y) / 2;

        (currentShape as fabric.Circle).set({
          left: centerX - radius,
          top: centerY - radius,
          radius: radius,
        });
      } else if (activeTool === "triangle") {
        const width = Math.abs(pointer.x - startPoint.x);
        const height = Math.abs(pointer.y - startPoint.y);

        // Set the triangle's position based on the start point and current point
        const left = pointer.x < startPoint.x ? pointer.x : startPoint.x;
        const top = pointer.y < startPoint.y ? pointer.y : startPoint.y;

        currentShape.set({
          left: left,
          top: top,
          width: width,
          height: height,
        });
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDown) return;

      setIsDown(false);
      setStartPoint(null);

      if (currentShape) {
        // Make the shape selectable after drawing
        currentShape.set({
          selectable: true,
        });

        // Sync to storage
        syncObjectToStorage(currentShape);

        canvas.setActiveObject(currentShape);
        setCurrentShape(null);
        canvas.renderAll();

        // Auto-deselect tool after use (like Figma)
        if (setActiveTool && activeTool !== "select") {
          setActiveTool("select");
        }
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [
    canvas,
    activeTool,
    currentColor,
    isDown,
    startPoint,
    currentShape,
    syncObjectToStorage,
    deleteObjectFromStorage,
  ]);

  // Handle tool changes
  useEffect(() => {
    if (!canvas) return;

    // Handle drawing mode for pencil
    if (activeTool === "pencil") {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = 3;
      }

      // Add event listener for path created
      const handlePathCreated = (e: any) => {
        const path = e.path;
        if (path) {
          syncObjectToStorage(path);

          // Auto-deselect tool after drawing
          if (setActiveTool) {
            setTimeout(() => {
              setActiveTool("select");
            }, 100);
          }
        }
      };

      canvas.on("path:created", handlePathCreated);

      return () => {
        canvas.off("path:created", handlePathCreated);
      };
    } else if (activeTool === "eraser") {
      // Set up eraser mode
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#f3f4f6"; // Background color
        canvas.freeDrawingBrush.width = 20; // Wider brush for eraser
      }

      // Add event listener for path created (to auto-deselect after erasing)
      const handlePathCreated = (e: any) => {
        const path = e.path;
        if (path) {
          // Auto-deselect tool after erasing
          if (setActiveTool) {
            setTimeout(() => {
              setActiveTool("select");
            }, 100);
          }
        }
      };

      canvas.on("path:created", handlePathCreated);

      return () => {
        canvas.off("path:created", handlePathCreated);
      };
    } else if (activeTool === "select") {
      // Enable object selection and canvas dragging
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });

      // Add event listener for object modified
      const handleObjectModified = (e: any) => {
        if (e.target) {
          syncObjectToStorage(e.target);
        }
      };

      // Enable canvas dragging when select tool is active
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;

      const handleCanvasMouseDown = (opt: any) => {
        const evt = opt.e;
        // Allow dragging by default with select tool
        isDragging = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;

        // If we're clicking on an object, don't drag the canvas
        if (canvas.getActiveObject() && opt.target) {
          isDragging = false;
        }

        if (isDragging) {
          canvas.selection = false;
        }
      };

      const handleCanvasMouseMove = (opt: any) => {
        if (isDragging) {
          const evt = opt.e;
          const deltaX = evt.clientX - lastPosX;
          const deltaY = evt.clientY - lastPosY;
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;

          // Pan the canvas
          const currentPoint = new fabric.Point(
            canvas.viewportTransform[4] + deltaX,
            canvas.viewportTransform[5] + deltaY,
          );
          canvas.absolutePan(
            new fabric.Point(-currentPoint.x, -currentPoint.y),
          );
          canvas.requestRenderAll();
        }
      };

      const handleCanvasMouseUp = () => {
        isDragging = false;
        canvas.selection = true;
      };

      canvas.on("mouse:down", handleCanvasMouseDown);
      canvas.on("mouse:move", handleCanvasMouseMove);
      canvas.on("mouse:up", handleCanvasMouseUp);
      canvas.on("object:modified", handleObjectModified);

      return () => {
        canvas.off("mouse:down", handleCanvasMouseDown);
        canvas.off("mouse:move", handleCanvasMouseMove);
        canvas.off("mouse:up", handleCanvasMouseUp);
        canvas.off("object:modified", handleObjectModified);
      };
    } else {
      // Other drawing tools
      canvas.isDrawingMode = false;
    }

    canvas.renderAll();
  }, [canvas, activeTool, currentColor, syncObjectToStorage, setActiveTool]);

  // Handle image upload
  useEffect(() => {
    if (activeTool === "image" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [activeTool]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      // Create a fabric Image object
      fabric.Image.fromURL(event.target.result.toString(), {
        // @ts-ignore - Fabric types are not accurate for this method
        onload: (img: fabric.Image) => {
          // Scale image to fit within the canvas
          const maxWidth = canvas.width! * 0.8;
          const maxHeight = canvas.height! * 0.8;

          if (img.width && img.height) {
            if (img.width > maxWidth || img.height > maxHeight) {
              const scaleFactor = Math.min(
                maxWidth / img.width,
                maxHeight / img.height,
              );
              img.scale(scaleFactor);
            }
          }

          // Center the image on the canvas
          img.set({
            left: canvas.width! / 2 - (img.width! * (img.scaleX || 1)) / 2,
            top: canvas.height! / 2 - (img.height! * (img.scaleY || 1)) / 2,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          // Sync to storage
          syncObjectToStorage(img);

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // Auto-deselect tool after use
          if (setActiveTool) {
            setActiveTool("select");
          }
        },
      });
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Canvas element */}
      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 h-full max-h-full w-full max-w-full"
      />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Cursor overlay component */}
      <CursorOverlay others={others} />
    </div>
  );
}
