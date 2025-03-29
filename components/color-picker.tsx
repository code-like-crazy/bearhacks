"use client"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const colors = [
    "#FF9B9B", // Red
    "#FFD699", // Orange
    "#FDFF8F", // Yellow
    "#91F48F", // Green
    "#9EFFFF", // Cyan
    "#B69CFF", // Purple
    "#FFC8F0", // Pink
    "#FFFFFF", // White
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((c) => (
        <button
          key={c}
          className={`h-8 w-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring ${color === c ? "ring-2 ring-primary" : "border-border"}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  )
}

