"use client"

import type React from "react"

interface ShapeElementProps {
  id: string
  style: React.CSSProperties
  content: {
    shape: "square" | "circle" | "triangle" | "diamond"
    color: string
    size: number
  }
  isSelected: boolean
}

export default function ShapeElement({ id, style, content, isSelected }: ShapeElementProps) {
  const { shape, color, size } = content

  switch (shape) {
    case "square":
      return (
        <div
          id={id}
          style={{
            ...style,
            width: size,
            height: size,
            border: `2px solid ${color}`,
            boxSizing: "border-box",
          }}
        />
      )
    case "circle":
      return (
        <div
          id={id}
          style={{
            ...style,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            boxSizing: "border-box",
          }}
        />
      )
    case "triangle":
      return (
        <div
          id={id}
          style={{
            ...style,
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            boxSizing: "border-box",
          }}
        />
      )
    case "diamond":
      return (
        <div
          id={id}
          style={{
            ...style,
            width: size,
            height: size,
            clipPath: `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`,
            border: `2px solid ${color}`,
            boxSizing: "border-box",
          }}
        />
      )
    default:
      return null
  }
}
