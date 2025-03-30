"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Circle,
  Diamond,
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
      icon: <MousePointer className="h-6 w-6" />,
      label: "Select",
      showColorPicker: false,
    },
    {
      id: "grab",
      icon: <Hand className="h-6 w-6" />,
      label: "Move Canvas",
      showColorPicker: false,
    },
    {
      id: "sticky",
      icon: <StickyNote className="h-6 w-6" />,
      label: "Sticky Note",
      showColorPicker: true,
    },
    {
      id: "image",
      icon: <Camera className="h-6 w-6" />,
      label: "Upload Image",
      showColorPicker: false,
    },
    {
      id: "pencil",
      icon: <Pencil className="h-6 w-6" />,
      label: "Draw",
      showColorPicker: true,
    },
    {
      id: "text",
      icon: <Text className="h-6 w-6" />,
      label: "Add Text",
      showColorPicker: false,
    },
    {
      id: "eraser",
      icon: <Eraser className="h-6 w-6" />,
      label: "Erase",
      showColorPicker: false,
    },
    {
      id: "stamp",
      icon: <Stamp className="h-6 w-6" />,
      label: "Stamps",
      showColorPicker: false,
    },
    {
      id: "shapes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M2 4.75C2 3.78424 2.78424 3 3.75 3H20.25C21.2158 3 22 3.78424 22 4.75V19.25C22 20.2158 21.2158 21 20.25 21H3.75C2.78424 21 2 20.2158 2 19.25V4.75ZM4.5 5.5V18.5H19.5V5.5H4.5ZM6 7H9V11H6V7ZM10.5 7H13.5V11H10.5V7ZM15 7H18V11H15V7ZM6 13H9V17H6V13ZM10.5 13H13.5V17H10.5V13ZM15 13H18V17H15V13Z" />
        </svg>
      ),
      label: "Shapes",
      showColorPicker: true,
      shapeOptions: [
        { id: "rectangle", icon: <Square className="h-5 w-5" /> },
        { id: "circle", icon: <Circle className="h-5 w-5" /> },
        { id: "triangle", icon: <Triangle className="h-5 w-5" /> },
      ],
    },
  ];

  return (
    <TooltipProvider>
      <div className="bg-background flex justify-center border-t p-4">
        <div className="bg-muted/30 flex items-center gap-2 rounded-full p-2 shadow-sm">
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
                      className="relative h-12 w-12 rounded-full"
                      onClick={() => onToolChange(tool.id as ToolType)}
                    >
                      {tool.icon}
                      {tool.showColorPicker && (
                        <motion.div
                          layoutId="active-tool-indicator"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: currentColor }}
                        />
                      )}
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
                          className="h-8 w-8"
                          onClick={() => onToolChange(shape.id as ToolType)}
                        >
                          {shape.icon}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                ) : tool.showColorPicker ? (
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
