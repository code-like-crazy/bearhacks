"use client";

import type React from "react";
import { useState } from "react";
import { Users, ZoomIn, ZoomOut } from "lucide-react";

import type { ToolType } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import Canvas from "./canvas";
import ChatPanel from "./chat-panel";
import Sidebar from "./sidebar";
import ToolBar from "./toolbar";

export default function Whiteboard() {
  const [boardName, setBoardName] = useState("Seoul");
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: "Alex", image: "/placeholder.svg?height=32&width=32" },
    { id: 2, name: "Jamie", image: "/placeholder.svg?height=32&width=32" },
    { id: 3, name: "Taylor", image: "/placeholder.svg?height=32&width=32" },
  ]);
  const [currentColor, setCurrentColor] = useState("#FF9B9B");

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "select") {
      setIsDragging(true);
      setStartDragPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startDragPosition.x,
        y: e.clientY - startDragPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b p-4">
          <div className="text-lg font-medium">{boardName}</div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {collaborators.map((user) => (
                <Avatar
                  key={user.id}
                  className="border-background h-8 w-8 border-2"
                >
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Invite
            </Button>
            <Button variant="outline">Templates</Button>
            <Button>Share</Button>
          </div>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <Button size="icon" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          <div
            className="relative flex-1 cursor-grab overflow-hidden"
            style={{
              cursor: isDragging
                ? "grabbing"
                : activeTool === "select"
                  ? "grab"
                  : "default",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Canvas
              scale={scale}
              position={position}
              activeTool={activeTool}
              isDragging={isDragging}
              currentColor={currentColor}
            />
          </div>

          {/* Right Chat Panel */}
          <ChatPanel />
        </div>

        <ToolBar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          currentColor={currentColor}
          onColorChange={handleColorChange}
        />
      </div>
    </div>
  );
}
