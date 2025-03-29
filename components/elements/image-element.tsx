"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"

interface ImageElementProps {
  id: string
  style: React.CSSProperties
  content: {
    src: string
    alt: string
    caption?: string
  }
  isSelected: boolean
  onBringToFront: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  canDrag: boolean
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBringToFront()

    if (!canDrag) return

    setIsDragging(true)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.stopPropagation()

    const x = e.clientX - dragOffset.x
    const y = e.clientY - dragOffset.y

    onPositionChange({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <Card
      className={`p-2 shadow-md overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}
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
          src={content.src || "/placeholder.svg"}
          alt={content.alt}
          width={200}
          height={200}
          className="rounded-md"
        />
        {content.caption && <div className="mt-1 text-center text-sm">{content.caption}</div>}
      </div>
    </Card>
  )
}

