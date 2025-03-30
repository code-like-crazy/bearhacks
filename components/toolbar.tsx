"use client";

import {
  Camera,
  Circle,
  Eraser,
  Hand,
  MousePointer,
  Pencil,
  Square,
  Stamp,
  StickyNote,
  Text,
  Triangle,
} from "lucide-react";

import type { ToolType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ColorPicker } from "./color-picker";

interface ToolBarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

export default function ToolBar({
  activeTool,
  onToolChange,
  currentColor,
  onColorChange,
}: ToolBarProps) {
  const tools = [
    {
      id: "select",
      icon: <MousePointer className="size-6" />,
      label: "Select",
    },
    {
      id: "grab",
      icon: <Hand className="size-6" />,
      label: "Move Canvas",
    },
    {
      id: "sticky",
      icon: <StickyNote className="size-6" />,
      label: "Sticky Note",
    },
    {
      id: "image",
      icon: <Camera className="size-6" />,
      label: "Upload Image",
    },
    {
      id: "pencil",
      icon: <Pencil className="size-6" />,
      label: "Draw",
    },
    {
      id: "text",
      icon: <Text className="size-6" />,
      label: "Add Text",
    },
    {
      id: "eraser",
      icon: <Eraser className="size-6" />,
      label: "Erase",
    },
    {
      id: "stamp",
      icon: <Stamp className="size-6" />,
      label: "Stamps",
      stampOptions: [
        { id: "👍", emoji: "👍" },
        { id: "👎", emoji: "A" },
        { id: "❤️", emoji: "❤️" },
        { id: "🔥", emoji: "🔥" },
        { id: "⭐", emoji: "⭐" },
        { id: "✅", emoji: "✅" },
        { id: "❌", emoji: "❌" },
        { id: "❓", emoji: "❓" },
        { id: "❗", emoji: "❗" },
        { id: "💯", emoji: "💯" },
      ],
    },
    {
      id: "shapes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path d="M2 4.75C2 3.78424 2.78424 3 3.75 3H20.25C21.2158 3 22 3.78424 22 4.75V19.25C22 20.2158 21.2158 21 20.25 21H3.75C2.78424 21 2 20.2158 2 19.25V4.75ZM4.5 5.5V18.5H19.5V5.5H4.5ZM6 7H9V11H6V7ZM10.5 7H13.5V11H10.5V7ZM15 7H18V11H15V7ZM6 13H9V17H6V13ZM10.5 13H13.5V17H10.5V13ZM15 13H18V17H15V13Z" />
        </svg>
      ),
      label: "Shapes",
      shapeOptions: [
        { id: "rectangle", icon: <Square className="size-5" /> },
        { id: "circle", icon: <Circle className="size-5" /> },
        { id: "triangle", icon: <Triangle className="size-5" /> },
      ],
    },
    {
      id: "color",
      icon: (
        <div className="flex items-center justify-center">
          <div
            className="size-6 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: currentColor }}
          />
        </div>
      ),
      label: "Color Picker",
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex justify-center border-t p-4">
        <div className="mr-72 flex items-center gap-2 rounded-full border p-2 shadow-sm">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={
                        activeTool === (tool.id as ToolType)
                          ? "default"
                          : "ghost"
                      }
                      className="relative size-12 rounded-full"
                      onClick={() => onToolChange(tool.id as ToolType)}
                    >
                      {tool.icon}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                {tool.shapeOptions ? (
                  <PopoverContent className="w-auto p-2" align="center">
                    <div className="grid grid-cols-2 gap-2">
                      {tool.shapeOptions.map((shape) => (
                        <Button
                          key={shape.id}
                          size="icon"
                          className="size-8"
                          onClick={() => onToolChange(shape.id as ToolType)}
                        >
                          {shape.icon}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                ) : tool.stampOptions ? (
                  <PopoverContent className="w-auto p-2" align="center">
                    <div className="grid grid-cols-5 gap-2">
                      {tool.stampOptions.map((stamp) => (
                        <Button
                          key={stamp.id}
                          size="icon"
                          className="size-8 text-lg"
                          onClick={() => {
                            // Store the selected emoji in localStorage
                            localStorage.setItem("selectedEmoji", stamp.emoji);
                            // Switch to stamp tool
                            onToolChange("stamp");
                          }}
                        >
                          {stamp.emoji}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                ) : tool.id === "color" ? (
                  <PopoverContent className="w-auto p-2" align="center">
                    <ColorPicker
                      color={currentColor}
                      onChange={onColorChange}
                    />
                  </PopoverContent>
                ) : null}
              </Popover>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
