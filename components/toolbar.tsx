"use client";

import Image from "next/image";
import {
  Circle,
  Hand,
  MousePointer,
  Shapes,
  Square,
  Stamp,
  Triangle,
  TypeOutline,
} from "lucide-react";
import { motion } from "motion/react";

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
      icon: (
        <Image
          src="/tools/sticky note.svg"
          alt="Sticky Note"
          width={40}
          height={40}
        />
      ),
      label: "Sticky Note",
    },
    {
      id: "image",
      icon: (
        <Image
          src="/tools/Polaroid.svg"
          alt="Upload Image"
          width={40}
          height={40}
        />
      ),
      label: "Upload Image",
    },
    {
      id: "pencil",
      icon: (
        <Image src="/tools/pencil.svg" alt="Pencil" width={32} height={32} />
      ),
      label: "Draw",
    },
    {
      id: "text",
      icon: <TypeOutline className="size-6" />,
      label: "Add Text",
    },
    {
      id: "eraser",
      icon: (
        <Image src="/tools/Eraser.svg" alt="Eraser" width={32} height={32} />
      ),
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
      icon: <Shapes className="size-6" />,
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
      <motion.div
        initial={{ y: -50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          mass: 1,
        }}
        className="mx-auto flex max-w-3xl -translate-x-36 items-center gap-4 rounded-full border p-2 shadow-sm"
      >
        {tools.map((tool, index) => (
          <Tooltip key={tool.id}>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: index * 0.05,
                    }}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        },
                      }}
                      whileTap={{
                        scale: 0.9,
                        rotate: -5,
                      }}
                      animate={{
                        backgroundColor:
                          activeTool === (tool.id as ToolType)
                            ? "var(--background-selected)"
                            : "transparent",
                        y: activeTool === (tool.id as ToolType) ? -4 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
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
                        <motion.div
                          initial={false}
                          animate={{
                            rotate:
                              activeTool === (tool.id as ToolType) ? 360 : 0,
                            scale:
                              activeTool === (tool.id as ToolType) ? 1.2 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          {tool.icon}
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                </TooltipTrigger>
              </PopoverTrigger>
              {tool.shapeOptions ? (
                <PopoverContent className="w-auto p-2" align="center" asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {tool.shapeOptions.map((shape, i) => (
                        <motion.div
                          key={shape.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: i * 0.1,
                          }}
                        >
                          <motion.div
                            whileHover={{
                              scale: 1.2,
                              rotate: 10,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              },
                            }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Button
                              size="icon"
                              className="size-8"
                              onClick={() => onToolChange(shape.id as ToolType)}
                            >
                              {shape.icon}
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </PopoverContent>
              ) : tool.stampOptions ? (
                <PopoverContent className="w-auto p-2" align="center" asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {tool.stampOptions.map((stamp, i) => (
                        <motion.div
                          key={stamp.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: i * 0.05,
                          }}
                        >
                          <motion.div
                            whileHover={{
                              scale: 1.3,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              },
                            }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <Button
                              size="icon"
                              className="size-8 text-lg"
                              onClick={() => {
                                localStorage.setItem(
                                  "selectedEmoji",
                                  stamp.emoji,
                                );
                                onToolChange("stamp");
                              }}
                            >
                              {stamp.emoji}
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </PopoverContent>
              ) : tool.id === "color" ? (
                <PopoverContent className="w-auto p-2" align="center" asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <ColorPicker
                      color={currentColor}
                      onChange={onColorChange}
                    />
                  </motion.div>
                </PopoverContent>
              ) : null}
            </Popover>
            <TooltipContent asChild>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <p>{tool.label}</p>
              </motion.div>
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>
    </TooltipProvider>
  );
}
