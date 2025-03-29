"use client";

import type React from "react";
import { useState } from "react";

interface StampElementProps {
  id: string;
  style: React.CSSProperties;
  content: {
    emoji: string;
    size: number;
  };
  isSelected: boolean;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  canDrag: boolean;
}

export default function StampElement({
  id,
  style,
  content,
  isSelected,
  onBringToFront,
  onPositionChange,
  canDrag,
}: StampElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBringToFront();

    if (!canDrag) return;

    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.stopPropagation();

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    onPositionChange({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${isSelected ? "ring-primary rounded-full ring-2" : ""}`}
      style={{
        ...style,
        cursor: isDragging ? "grabbing" : canDrag ? "grab" : "default",
        fontSize: `${content.size}px`,
        lineHeight: 1,
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {content.emoji}
    </div>
  );
}
