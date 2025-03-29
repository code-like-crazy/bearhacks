"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Eraser, Text, Move, Upload } from "lucide-react"
import type { ToolType } from "@/lib/types"
import { ColorPicker } from "./color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion } from "framer-motion"

interface ToolBarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  currentColor: string
  onColorChange: (color: string) => void
}

export default function ToolBar({ activeTool, onToolChange, currentColor, onColorChange }: ToolBarProps) {
  const tools = [
    { 
      id: "camera", 
      element: (
        <div className="w-full h-full flex items-center justify-center">
          {/* Polaroid Camera SVG based on your image */}
          <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="180" height="140" rx="10" fill="white" stroke="#DDDDDD" strokeWidth="2"/>
            <rect x="10" y="120" width="180" height="40" rx="5" fill="#EEEEEE" stroke="#DDDDDD" strokeWidth="1"/>
            <circle cx="100" cy="80" r="35" fill="#333333" stroke="#111111" strokeWidth="3"/>
            <circle cx="100" cy="80" r="25" fill="#222222" stroke="#111111" strokeWidth="1"/>
            <circle cx="100" cy="80" r="15" fill="#0A3F6B"/>
            <circle cx="40" cy="50" r="10" fill="#333333"/>
            <circle cx="40" cy="50" r="6" fill="#222222"/>
            <circle cx="160" cy="50" r="10" fill="#333333"/>
            <circle cx="160" cy="50" r="6" fill="#222222"/>
            <circle cx="40" cy="50" r="3" fill="white"/>
            <rect x="85" y="20" width="30" height="10" rx="3" fill="#444444"/>
            <circle cx="50" cy="80" r="8" fill="#DD3333"/>
            <rect x="150" y="85" width="15" height="15" rx="3" fill="white" stroke="#BBBBBB"/>
            <text x="155" y="97" fill="#0066FF" fontSize="12" fontWeight="bold">+</text>
            <rect x="80" y="140" width="40" height="5" rx="2" fill="#333333"/>
            <rect x="90" y="130" width="20" height="25" rx="2" fill="none" stroke="#DDDDDD"/>
            <rect x="95" y="160" width="10" height="5" rx="2" fill="#CCCCCC"/>
            {/* Rainbow stripe */}
            <rect x="93" y="20" width="3" height="140" fill="#FF0000"/>
            <rect x="96" y="20" width="3" height="140" fill="#FF9900"/>
            <rect x="99" y="20" width="3" height="140" fill="#FFFF00"/>
            <rect x="102" y="20" width="3" height="140" fill="#00FF00"/>
            <rect x="105" y="20" width="3" height="140" fill="#0099FF"/>
          </svg>
        </div>
      ),
      label: "Upload Image", 
      showColorPicker: false 
    },
    { 
      id: "sticky", 
      element: (
        <div className="w-full h-full flex items-center justify-center">
          {/* Sticky Note with paper clip */}
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(15, 50, 50)">
              <rect x="20" y="20" width="60" height="60" rx="3" fill="#FFC0CB" stroke="#777777" strokeWidth="1"/>
              <path d="M70 30L80 30L80 40" stroke="#999999" strokeWidth="2"/>
              <path d="M80 30L70 40" stroke="#999999" strokeWidth="2"/>
              <path d="M15 30C15 25 20 15 25 20C30 25 25 40 15 30Z" fill="#CCCCCC" stroke="#999999" strokeWidth="1"/>
            </g>
          </svg>
        </div>
      ), 
      label: "Sticky Note", 
      showColorPicker: true 
    },
    { 
      id: "pencil", 
      element: (
        <div className="w-full h-full flex items-center justify-center">
          {/* Pencil SVG based on your image */}
          <svg width="10" height="32" viewBox="0 0 10 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 0L9 4L5 32L1 4L5 0Z" fill="#FFC700" stroke="#333333" strokeWidth="0.5"/>
            <path d="M5 0L1 4L5 4L9 4L5 0Z" fill="#333333"/>
            <rect x="3" y="28" width="4" height="4" fill="white" stroke="#333333" strokeWidth="0.5"/>
            <rect x="3" y="30" width="4" height="2" fill="#FFAAAA" stroke="#333333" strokeWidth="0.5"/>
          </svg>
        </div>
      ), 
      label: "Draw", 
      showColorPicker: true 
    },
    { 
      id: "text", 
      element: (
        <div className="w-full h-full flex items-center justify-center border-2 border-black rounded-md bg-white">
          <span className="text-lg font-bold">T</span>
        </div>
      ), 
      label: "Add Text", 
      showColorPicker: false 
    },
    { 
      id: "upload", 
      element: (
        <div className="w-full h-full flex items-center justify-center border-2 border-black rounded-md bg-white">
          <Upload className="h-6 w-6" />
        </div>
      ), 
      label: "Upload", 
      showColorPicker: false 
    },
    { 
      id: "square", 
      element: (
        <div className="w-full h-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="60" height="60" stroke="black" strokeWidth="3" fill="none"/>
          </svg>
        </div>
      ), 
      label: "Square", 
      showColorPicker: true 
    },
    { 
      id: "eraser", 
      element: (
        <div className="w-full h-full flex items-center justify-center">
          <Eraser className="h-6 w-6" />
        </div>
      ), 
      label: "Erase", 
      showColorPicker: false 
    },
    { 
      id: "grab", 
      element: (
        <div className="w-full h-full flex items-center justify-center">
          <Move className="h-6 w-6" />
        </div>
      ), 
      label: "Grab", 
      showColorPicker: false 
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex justify-center p-4 border-t bg-gray-50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-full shadow-md">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <motion.div
                      animate={{ 
                        y: activeTool === (tool.id as ToolType) ? -8 : 0,
                        scale: activeTool === (tool.id as ToolType) ? 1.1 : 1
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative"
                    >
                      <Button
                        size="icon"
                        variant={activeTool === (tool.id as ToolType) ? "default" : "ghost"}
                        className="h-12 w-12 rounded-full relative overflow-hidden"
                        onClick={() => onToolChange(tool.id as ToolType)}
                      >
                        {tool.element}
                        
                        {tool.showColorPicker && (
                          <motion.div
                            layoutId="active-tool-indicator"
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: currentColor }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                </PopoverTrigger>
                {tool.showColorPicker && (
                  <PopoverContent className="w-auto p-2" align="center">
                    <ColorPicker color={currentColor} onChange={onColorChange} />
                  </PopoverContent>
                )}
              </Popover>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}