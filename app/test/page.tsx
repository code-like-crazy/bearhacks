"use client";

import { useEffect, useState } from "react";
import * as fabric from "fabric";

import { ToolType } from "@/lib/types";
import { Button } from "@/components/ui/button";

const TestPage = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  // State for canvas properties
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [currentColor, setCurrentColor] = useState("#60a5fa");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const c = new fabric.Canvas("canvas", {
      height: window.innerHeight - 150, // Adjust for header and toolbar
      width: window.innerWidth,
      backgroundColor: "#f3f4f6", // Light gray background
    });

    // settings for all canvas in the app
    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerStyle = "rect";
    fabric.FabricObject.prototype.cornerStrokeColor = "#2BEBC8";
    fabric.FabricObject.prototype.cornerSize = 6;

    setCanvas(c);

    // Handle window resize
    const handleResize = () => {
      c.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 150,
      });
      c.renderAll();
    };

    window.addEventListener("resize", handleResize);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "v": // Select tool
          setActiveTool("select");
          break;
        case "p": // Pencil tool
          setActiveTool("pencil");
          if (canvas) {
            canvas.isDrawingMode = true;
            if (canvas.freeDrawingBrush) {
              canvas.freeDrawingBrush.color = currentColor;
            }
            canvas.renderAll();
          }
          break;
        case "t": // Text tool
          setActiveTool("text");
          break;
        case "e": // Eraser tool
          setActiveTool("eraser");
          break;
        case "r": // Rectangle tool
          setActiveTool("rectangle");
          break;
        case "c": // Circle tool
          setActiveTool("circle");
          break;
        case "s": // Sticky note tool
          setActiveTool("sticky");
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setScale((prev) => Math.min(prev + 0.1, 3));
            if (canvas) {
              canvas.zoomToPoint(
                new fabric.Point(window.innerWidth / 2, window.innerHeight / 2),
                Math.min(canvas.getZoom() * 1.1, 3),
              );
              canvas.renderAll();
            }
          }
          break;
        case "-": // Zoom out
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setScale((prev) => Math.max(prev - 0.1, 0.5));
            if (canvas) {
              canvas.zoomToPoint(
                new fabric.Point(window.innerWidth / 2, window.innerHeight / 2),
                Math.max(canvas.getZoom() * 0.9, 0.5),
              );
              canvas.renderAll();
            }
          }
          break;
        case "0": // Reset zoom
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setScale(1);
            setPosition({ x: 0, y: 0 });
            if (canvas) {
              canvas.setZoom(1);
              canvas.absolutePan(new fabric.Point(0, 0));
              canvas.renderAll();
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      c.dispose();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Mock board data for testing
  const mockBoard = {
    id: "test-board-id",
    name: "Test Board",
    imageUrl: "/placeholder.svg",
    inviteCode: "TEST123",
    createdAt: Date.now(),
    lockedAt: null,
    creatorId: "test-user-id",
  };

  // Available tools
  const tools: { id: ToolType; label: string }[] = [
    { id: "select", label: "Select" },
    { id: "sticky", label: "Sticky Note" },
    { id: "pencil", label: "Pencil" },
    { id: "text", label: "Text" },
    { id: "eraser", label: "Eraser" },
    { id: "rectangle", label: "Rectangle" },
    { id: "circle", label: "Circle" },
    { id: "triangle", label: "Triangle" },
  ];

  // Available colors
  const colors = [
    "#f87171", // Red
    "#fb923c", // Orange
    "#fde047", // Yellow
    "#4ade80", // Green
    "#60a5fa", // Blue
    "#c084fc", // Purple
    "#FFFFFF", // White
    "#111111", // Black
  ];

  // Track drawing state
  const [isDown, setIsDown] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentShape, setCurrentShape] = useState<fabric.Object | null>(null);

  // Handle keyboard events for deletion
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
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
  }, [canvas]);

  // Handle mouse down on canvas
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (options: fabric.TEvent) => {
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
        // Switch back to select tool after adding text
        setActiveTool("select");
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
        const stickyId = Date.now().toString();
        (stickyNote as any).stickyId = stickyId;
        (textbox as any).stickyId = stickyId;
        (authorText as any).stickyId = stickyId;

        // Add deletion handler to remove all related elements
        const handleObjectRemoved = (opt: any) => {
          if (opt.target && (opt.target as any).stickyId === stickyId) {
            const id = (opt.target as any).stickyId;
            canvas.getObjects().forEach((obj) => {
              if ((obj as any).stickyId === id && obj !== opt.target) {
                canvas.remove(obj);
              }
            });
          }
        };

        canvas.on("object:removed", handleObjectRemoved);

        // Switch back to select tool after adding sticky
        setActiveTool("select");
        setIsDown(false);
        setStartPoint(null);
      }
    };

    const handleMouseMove = (options: fabric.TEvent) => {
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

        currentShape.set({
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

        canvas.setActiveObject(currentShape);
        setCurrentShape(null);
        canvas.renderAll();
      }

      // Switch back to select tool after drawing
      if (
        activeTool !== "select" &&
        activeTool !== "pencil" &&
        activeTool !== "eraser"
      ) {
        setActiveTool("select");
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
  }, [canvas, activeTool, currentColor, isDown, startPoint, currentShape]);

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);

    if (!canvas) return;

    // Handle drawing mode for pencil
    if (tool === "pencil") {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = 3;
      }
    } else if (tool === "eraser") {
      // Set up eraser mode
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#f3f4f6"; // Background color
        canvas.freeDrawingBrush.width = 20; // Wider brush for eraser
      }
    } else if (tool === "select") {
      // Enable object selection
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
    } else {
      // Other drawing tools
      canvas.isDrawingMode = false;
    }

    canvas.renderAll();
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Simple toolbar */}
      <div className="bg-background flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">Test Canvas</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={() => {
                setScale((prev) => Math.max(prev - 0.1, 0.5));
                if (canvas) {
                  canvas.zoomToPoint(
                    new fabric.Point(
                      window.innerWidth / 2,
                      window.innerHeight / 2,
                    ),
                    Math.max(canvas.getZoom() * 0.9, 0.5),
                  );
                  canvas.renderAll();
                }
              }}
            >
              -
            </Button>
            <span className="mx-2">{Math.round(scale * 100)}%</span>
            <Button
              size="sm"
              onClick={() => {
                setScale((prev) => Math.min(prev + 0.1, 3));
                if (canvas) {
                  canvas.zoomToPoint(
                    new fabric.Point(
                      window.innerWidth / 2,
                      window.innerHeight / 2,
                    ),
                    Math.min(canvas.getZoom() * 1.1, 3),
                  );
                  canvas.renderAll();
                }
              }}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Tools and color picker */}
      <div className="bg-background flex items-center justify-center gap-2 border-b p-2">
        <div className="flex items-center gap-1 rounded-md border p-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              size="sm"
              variant={activeTool === tool.id ? "default" : "outline"}
              onClick={() => handleToolClick(tool.id)}
            >
              {tool.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-md border p-1">
          {colors.map((color) => (
            <div
              key={color}
              className="size-6 cursor-pointer rounded-full border"
              style={{ backgroundColor: color }}
              onClick={() => {
                setCurrentColor(color);
                if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
                  canvas.freeDrawingBrush.color = color;
                }
              }}
            >
              {color === currentColor && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden bg-gray-100">
        {/* Status bar */}
        <div className="absolute bottom-4 left-4 z-10 rounded-md bg-white p-2 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <div>
              Tool: <span className="font-semibold">{activeTool}</span>
            </div>
            <div>
              Color:
              <span
                className="ml-1 inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            <div>
              Zoom:{" "}
              <span className="font-semibold">{Math.round(scale * 100)}%</span>
            </div>
            <div>
              Position:{" "}
              <span className="font-semibold">
                ({Math.round(position.x)}, {Math.round(position.y)})
              </span>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts help */}
        <div className="absolute right-4 bottom-4 z-10 rounded-md bg-white p-2 text-xs shadow-md">
          <div className="font-bold">Keyboard Shortcuts:</div>
          <div>V: Select tool</div>
          <div>P: Pencil tool</div>
          <div>T: Text tool</div>
          <div>E: Eraser tool</div>
          <div>R: Rectangle tool</div>
          <div>C: Circle tool</div>
          <div>S: Sticky note</div>
          <div>Ctrl/⌘ +/-: Zoom in/out</div>
          <div>Ctrl/⌘ + 0: Reset view</div>
        </div>

        {/* Canvas element */}
        <canvas id="canvas" />
      </div>
    </div>
  );
};

export default TestPage;
