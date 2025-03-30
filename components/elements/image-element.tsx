"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Card } from "@/components/ui/card";

interface ImageElementProps {
  id: string;
  style: React.CSSProperties;
  content: {
    src: string;
    alt: string;
    caption?: string;
  };
  isSelected: boolean;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  canDrag: boolean;
}

export default function ImageElement({
  id,
  style,
  content,
  isSelected,
  onBringToFront,
  onPositionChange,
  canDrag,
}: ImageElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<string>(
    content.src || "/placeholder.svg",
  );
  const [imageError, setImageError] = useState(false);

  // Handle image loading errors
  useEffect(() => {
    if (content.src) {
      setImageSrc(content.src);
      setImageError(false);
    }
  }, [content.src]);

  const handleImageError = () => {
    console.error("Failed to load image:", content.src);
    setImageError(true);
    setImageSrc("/placeholder.svg");
  };

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
    <Card
      className={`overflow-hidden p-2 shadow-md ${isSelected ? "ring-primary ring-2" : ""}`}
      style={{
        ...style,
        cursor: isDragging ? "grabbing" : canDrag ? "grab" : "default",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative">
        <Image
          src={imageSrc}
          alt={content.alt || "Image"}
          width={200}
          height={200}
          className="rounded-md"
          onError={handleImageError}
          unoptimized={imageSrc.startsWith("data:")} // Required for data URLs
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-gray-100">
            <span className="text-sm text-gray-500">Failed to load image</span>
          </div>
        )}
        {content.caption && (
          <div className="mt-1 text-center text-sm">{content.caption}</div>
        )}
      </div>
    </Card>
  );
}
