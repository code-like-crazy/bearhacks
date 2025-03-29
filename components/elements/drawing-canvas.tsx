"use client"

import React, { useEffect } from "react" // Import useEffect

interface DrawingCanvasProps {
  id: string
  style: React.CSSProperties
  content: {
    path: { x: number; y: number }[]
    color: string
    strokeWidth: number
  }
  isSelected: boolean
}

export default function DrawingCanvas({ id, style, content, isSelected }: DrawingCanvasProps) {
  useEffect(() => {
    console.log(`DrawingCanvas ${id} rendered with path length: ${content.path.length}`);
  }, [id, content.path]); // Log when component renders or path changes significantly

  const { path, color, strokeWidth } = content

  if (path.length < 2) return null

  // Calculate the bounding box of the path
  const minX = Math.min(...path.map((p) => p.x))
  const minY = Math.min(...path.map((p) => p.y))
  const maxX = Math.max(...path.map((p) => p.x))
  const maxY = Math.max(...path.map((p) => p.y))

  const width = maxX - minX + strokeWidth * 2
  const height = maxY - minY + strokeWidth * 2

  // Adjust the path to be relative to the SVG
  const adjustedPath = path.map((p) => ({
    x: p.x - minX + strokeWidth,
    y: p.y - minY + strokeWidth,
  }))

  return (
    <div
      className={`absolute ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        ...style,
        left: `${minX - strokeWidth}px`,
        top: `${minY - strokeWidth}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path
          d={`M ${adjustedPath.map((p) => `${p.x},${p.y}`).join(" L ")}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
