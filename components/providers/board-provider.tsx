"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { ToolType } from "@/lib/types";

interface Position {
  x: number;
  y: number;
}

interface BoardContextType {
  boardName: string;
  activeTool: ToolType;
  scale: number;
  position: Position;
  isDragging: boolean;
  currentColor: string;
  setScale: (scale: number) => void;
  setPosition: (position: Position) => void;
  setIsDragging: (isDragging: boolean) => void;
  setActiveTool: (tool: ToolType) => void;
  setCurrentColor: (color: string) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

const BoardContext = createContext<BoardContextType | null>(null);

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return context;
}

interface BoardProviderProps {
  boardName: string;
  children: React.ReactNode;
}

export function BoardProvider({ boardName, children }: BoardProviderProps) {
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState("#60a5fa");

  // Listen for zoom events from the canvas
  useEffect(() => {
    const handleZoom = (e: CustomEvent) => {
      const { scale: newScale, pointer } = e.detail;

      // Update scale
      setScale(newScale);

      // Adjust position to zoom toward/from the cursor position
      // This creates a more natural zoom experience
      if (pointer) {
        const factor = newScale / scale;
        const newX = pointer.x - (pointer.x - position.x) * factor;
        const newY = pointer.y - (pointer.y - position.y) * factor;

        setPosition({ x: newX, y: newY });
      }
    };

    document.addEventListener("canvas:zoom", handleZoom as EventListener);

    return () => {
      document.removeEventListener("canvas:zoom", handleZoom as EventListener);
    };
  }, [scale, position]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "select") {
      setIsDragging(true);
      setStartDragPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startDragPosition.x,
        y: e.clientY - startDragPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <BoardContext.Provider
      value={{
        boardName,
        activeTool,
        scale,
        position,
        isDragging,
        currentColor,
        setScale,
        setPosition,
        setIsDragging,
        setActiveTool,
        setCurrentColor,
        handleZoomIn,
        handleZoomOut,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
