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
    const parentHeight = window.innerHeight - 164; // Adjust for header and toolbar

    const c = new fabric.Canvas("canvas", {
      height: parentHeight,
      width: parentWidth,
      backgroundColor: "#f3f4f6", // Light gray background
    });

    // Settings for all canvas in the app
    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerStyle = "circle";
    fabric.FabricObject.prototype.cornerStrokeColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerSize = 6;

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

    // canvas.clear();

    // Add objects from storage
    Array.from(canvasObjects.entries()).forEach(([objectId, objectData]) => {
      if (!objectData) return; // Skip if object data is null/undefined

      try {
        // @ts-ignore - Fabric types are not accurate for this method
        fabric.util.enlivenObjects([objectData], function (objects: any[]) {
          objects.forEach(function (obj: any) {
            if (!obj) return; // Skip if object creation failed
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

        // Create a group for the sticky note
        // First, create the background rectangle
        const stickyNote = new fabric.Rect({
          width: stickyWidth,
          height: stickyHeight,
          left: 0,
          top: 0,
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

        // Create editable text
        const textbox = new fabric.Textbox("Double-click to edit", {
          width: stickyWidth - 20,
          left: 10,
          top: 10,
          fontSize: 16,
          fontFamily: "Arial",
          fill: "#333333",
          editable: true,
        });

        // Create author text
        const authorText = new fabric.IText("User", {
          left: stickyWidth - 40,
          top: stickyHeight - 20,
          fontSize: 12,
          fontFamily: "Arial",
          fill: "#666666",
        });

        // Create a group with all elements
        const stickyGroup = new fabric.Group([stickyNote, authorText], {
          left: pointer.x,
          top: pointer.y,
          subTargetCheck: true,
        });

        // Add the group to canvas
        canvas.add(stickyGroup);

        // Add textbox separately to allow independent editing
        textbox.set({
          left: pointer.x + 10,
          top: pointer.y + 10,
        });
        canvas.add(textbox);

        // Set up movement synchronization
        const moveTextWithGroup = (opt: any) => {
          if (opt.target === stickyGroup) {
            textbox.set({
              left: stickyGroup.left! + 10,
              top: stickyGroup.top! + 10,
            });
            canvas.renderAll();
          }
        };

        // Add event listeners for synchronized movement
        canvas.on("object:moving", moveTextWithGroup);

        // Add custom property to identify related elements
        const stickyId = nanoid();
        (stickyGroup as any).stickyId = stickyId;
        (textbox as any).stickyId = stickyId;

        // Sync to storage
        (stickyGroup as any).objectId = `sticky-${stickyId}-group`;
        (textbox as any).objectId = `sticky-${stickyId}-text`;

        syncObjectToStorage(stickyGroup);
        syncObjectToStorage(textbox);

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

      // Create a new pencil brush
      const pencilBrush = new fabric.PencilBrush(canvas);
      pencilBrush.color = currentColor;
      pencilBrush.width = 3;
      canvas.freeDrawingBrush = pencilBrush;

      // Add event listener for path created
      const handlePathCreated = (e: any) => {
        const path = e.path;
        if (path) {
          syncObjectToStorage(path);
        }
      };

      canvas.on("path:created", handlePathCreated);

      return () => {
        canvas.off("path:created", handlePathCreated);
      };
    } else if (activeTool === "eraser") {
      // Set up eraser mode
      canvas.isDrawingMode = true;

      // Create a new pencil brush for erasing
      const eraserBrush = new fabric.PencilBrush(canvas);
      eraserBrush.color = "#f3f4f6"; // Background color
      eraserBrush.width = 20; // Wider brush for eraser
      canvas.freeDrawingBrush = eraserBrush;

      // Add event listener for path created
      const handlePathCreated = (e: any) => {
        const path = e.path;
        if (path) {
          syncObjectToStorage(path);
        }
      };

      canvas.on("path:created", handlePathCreated);

      return () => {
        canvas.off("path:created", handlePathCreated);
      };
    } else if (activeTool === "select") {
      // Enable object selection but not canvas dragging
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

      canvas.on("object:modified", handleObjectModified);

      return () => {
        canvas.off("object:modified", handleObjectModified);
      };
    } else if (activeTool === "grab") {
      // Enable canvas dragging but disable object selection
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
      });

      // Enable canvas dragging
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;

      const handleCanvasMouseDown = (opt: any) => {
        const evt = opt.e;
        isDragging = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.selection = false;
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
      };

      canvas.on("mouse:down", handleCanvasMouseDown);
      canvas.on("mouse:move", handleCanvasMouseMove);
      canvas.on("mouse:up", handleCanvasMouseUp);

      return () => {
        canvas.off("mouse:down", handleCanvasMouseDown);
        canvas.off("mouse:move", handleCanvasMouseMove);
        canvas.off("mouse:up", handleCanvasMouseUp);
      };
    } else if (activeTool === "stamp") {
      // Implement emoji stamp functionality
      canvas.isDrawingMode = false;
      canvas.selection = true;

      // Create a stamp handler
      const handleStampClick = (opt: any) => {
        if (!canvas) return;

        const pointer = canvas.getPointer(opt.e);

        // Get the selected emoji from localStorage, or use a default
        const emoji = localStorage.getItem("selectedEmoji") || "👍";

        // Create a text object with the emoji
        const stamp = new fabric.Text(emoji, {
          left: pointer.x,
          top: pointer.y,
          fontSize: 40,
          fontFamily: "Arial",
          fill: currentColor,
          originX: "center",
          originY: "center",
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        // Add custom property to identify as a stamp
        (stamp as any).isStamp = true;
        (stamp as any).emoji = emoji;

        canvas.add(stamp);
        canvas.setActiveObject(stamp);
        canvas.renderAll();

        // Sync to storage
        syncObjectToStorage(stamp);

        // Switch back to select tool after placing stamp
        if (setActiveTool) {
          setTimeout(() => {
            setActiveTool("select");
          }, 100);
        }
      };

      canvas.on("mouse:down", handleStampClick);

      return () => {
        canvas.off("mouse:down", handleStampClick);
      };
    } else if (activeTool === "shapes") {
      // This is just a parent category in the toolbar, not an actual tool
      // Auto-select rectangle as default shape
      if (setActiveTool) {
        setActiveTool("rectangle");
      }
    } else if (activeTool === "image" && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Other drawing tools
      canvas.isDrawingMode = false;
    }

    canvas.renderAll();
  }, [canvas, activeTool, currentColor, syncObjectToStorage, setActiveTool]);

  // Handle image upload
  useEffect(() => {
    if (activeTool === "image" && fileInputRef.current) {
      // Only trigger file input click if it's a new selection of the image tool
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

      // Create a unique filename for the image
      const fileExtension = file.name.split(".").pop() || "png";
      const uniqueId = nanoid(8);
      const fileName = `image-${uniqueId}.${fileExtension}`;

      // In a real implementation, we would upload the file to the server here
      // For now, we'll use the data URL directly
      const imageUrl = event.target.result.toString();

      // Create a fabric Image object
      fabric.FabricImage.fromURL(imageUrl, {
        // @ts-ignore - Fabric types are not accurate for this method
        onload: (img: fabric.FabricImage) => {
          // Scale image to fit within the canvas
          const maxWidth = canvas.width! * 0.8;
          const maxHeight = canvas.height! * 0.8;

          let scaleFactor = 1;
          if (img.width && img.height) {
            if (img.width > maxWidth || img.height > maxHeight) {
              scaleFactor = Math.min(
                maxWidth / img.width,
                maxHeight / img.height,
              );
              img.scale(scaleFactor);
            }
          }

          // Center the image on the canvas
          const left = canvas.width! / 2 - (img.width! * (img.scaleX || 1)) / 2;
          const top =
            canvas.height! / 2 - (img.height! * (img.scaleY || 1)) / 2;

          img.set({
            left: left,
            top: top,
          });

          // Add custom properties to the image
          (img as any).originalFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            uniqueFileName: fileName,
          };

          // Set the image source as a property that can be serialized
          (img as any).src = imageUrl;
          (img as any).alt = file.name;

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

          console.log(`Image added: ${fileName}`);
        },
      });
    };

    reader.readAsDataURL(file);

    // Switch to select tool immediately to prevent multiple file dialogs
    if (setActiveTool) {
      setActiveTool("select");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Canvas element */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => {
            console.log("Current Canvas Objects:", {
              storageSize: canvasObjects.size,
              objects: Array.from(canvasObjects.entries()).map(([id, obj]) => ({
                id,
                type: obj.type,
                ...obj,
              })),
            });
          }}
          className="rounded-xl bg-teal-500 p-4 hover:bg-teal-600"
        >
          Show Objects
        </button>
        <button
          onClick={() => {
            if (canvas && canvasObjects) {
              // Clear the canvas
              canvas.clear();
              canvas.renderAll();

              // Clear all objects from storage using the mutation
              Array.from(canvasObjects.keys()).forEach((key) => {
                deleteObjectFromStorage(key);
              });
            }
          }}
          className="rounded-xl bg-red-500 p-4 hover:bg-red-600"
        >
          Clear All
        </button>
      </div>
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
