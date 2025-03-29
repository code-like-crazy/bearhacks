"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"

interface StickyNoteProps {
  id: string
  style: React.CSSProperties
  content: {
    text: string
    color: string
    author: string
  }
  isSelected: boolean
  onBringToFront: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  onContentChange: (content: { text?: string; color?: string }) => void
  canDrag: boolean
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBringToFront()

    if (isEditing || !canDrag) return

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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      }
    }, 0)
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange({ text: e.target.value })
  }

  return (
    <Card
      className={`w-[250px] h-[180px] shadow-md overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        ...style,
        backgroundColor: content.color,
        cursor: isDragging ? "grabbing" : isEditing ? "text" : canDrag ? "grab" : "default",
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
          className="w-full h-[140px] p-4 bg-transparent resize-none focus:outline-none"
          value={content.text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="p-4 h-[140px] overflow-auto">{content.text}</div>
      )}
      <div className="p-2 text-xs text-right text-muted-foreground">{content.author}</div>
    </Card>
  )
}

