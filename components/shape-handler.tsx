"use client";

import React, { useState, useEffect } from 'react';
import { ToolType } from "@/lib/types";

interface ShapeHandlerProps {
  activeTool: ToolType;
  currentColor: string;
  scale: number;
  position: { x: number; y: number };
}

const ShapeHandler: React.FC<ShapeHandlerProps> = ({ activeTool, currentColor, scale, position }) => {
  const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ x: number, y: number } | null>(null);
  const [shapeType, setShapeType] = useState<"square" | "circle" | "triangle" | "diamond" | null>(null);
  const [size, setSize] = useState(50);

  useEffect(() => {
    if (activeTool?.startsWith("shape-")) {
      setShapeType(activeTool.split("-")[1] as "square" | "circle" | "triangle" | "diamond");
    } else {
      setShapeType(null);
    }
  }, [activeTool]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    setStartPosition({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPosition) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    setCurrentPosition({ x, y });
  };

  const handleMouseUp = () => {
    setStartPosition(null);
    setCurrentPosition(null);
  };

  if (!startPosition || !currentPosition || !shapeType) {
    return null;
  }

  const width = Math.abs(currentPosition.x - startPosition.x);
  const height = Math.abs(currentPosition.y - startPosition.y);
  const style = {
    position: "absolute" as const,
    left: Math.min(startPosition.x, currentPosition.x),
    top: Math.min(startPosition.y, currentPosition.y),
    width: width,
    height: height,
    border: `2px dashed ${currentColor}`,
    pointerEvents: "none" as const,
  };

  return (
    <div
      style={style}
    >
      {shapeType}
    </div>
  );
};

export default ShapeHandler;
