"use client";

import type React from "react";
import { useRef, useState } from "react";

interface TextElementProps {
  id: string;
  style: React.CSSProperties;
  content: {
    text: string;
    fontSize: number;
    color: string;
  };
  isSelected: boolean;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onContentChange: (content: {
    text?: string;
    fontSize?: number;
    color?: string;
  }) => void;
  canDrag: boolean;
}

export default function TextElement({
  id,
  style,
  content,
  isSelected,
  onBringToFront,
  onPositionChange,
  onContentChange,
  canDrag,
}: TextElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBringToFront();

    if (isEditing || !canDrag) return;

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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onContentChange({ text: e.target.value });
  };

  return (
    <div
      className={`p-1 ${isSelected ? "ring-primary rounded ring-2" : ""}`}
      style={{
        ...style,
        cursor: isDragging
          ? "grabbing"
          : isEditing
            ? "text"
            : canDrag
              ? "grab"
              : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="border-primary border bg-transparent p-1 focus:outline-none"
          value={content.text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: `${content.fontSize}px`,
            color: content.color,
          }}
        />
      ) : (
        <div
          style={{
            fontSize: `${content.fontSize}px`,
            color: content.color,
            padding: "2px",
          }}
        >
          {content.text}
        </div>
      )}
    </div>
  );
}
