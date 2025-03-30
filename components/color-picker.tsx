"use client";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const colors = [
    "#f87171", // Red
    "#fb923c", // Orange
    "#fde047", // Yellow
    "#4ade80", // Green
    "#60a5fa", // Blue
    "#c084fc", // Purple
    "#FFFFFF", // White
    "#111111", // Black
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((c) => (
        <button
          key={c}
          className={`focus:ring-ring h-8 w-8 rounded-full border shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:outline-none ${color === c ? "ring-primary ring-2" : "border-border"}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}
