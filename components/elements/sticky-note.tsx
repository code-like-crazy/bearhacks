"use client";

import type React from "react";
import { useRef, useState } from "react";

import { Card } from "@/components/ui/card";

interface StickyNoteProps {
  id: string;
  style: React.CSSProperties;
  content: {
    text: string;
    color: string;
    author: string;
  };
  isSelected: boolean;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onContentChange: (content: { text?: string; color?: string }) => void;
  canDrag: boolean;
}

export default function StickyNoteElement({
  id,
  style,
  content,
  isSelected,
  onBringToFront,
  onPositionChange,
  onContentChange,
  canDrag,
}: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange({ text: e.target.value });
  };

  return (
    <Card
      className={`h-[180px] w-[250px] overflow-hidden shadow-md ${isSelected ? "ring-primary ring-2" : ""}`}
      style={{
        ...style,
        backgroundColor: content.color,
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
        <textarea
          ref={textareaRef}
          className="h-[140px] w-full resize-none bg-transparent p-4 focus:outline-none"
          value={content.text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="h-[140px] overflow-auto p-4">{content.text}</div>
      )}
      <div className="text-muted-foreground p-2 text-right text-xs">
        {content.author}
      </div>
    </Card>
  );
}
