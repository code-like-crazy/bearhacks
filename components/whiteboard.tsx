"use client";

import { type boards } from "@/lib/db/schema";
import type { ToolType } from "@/lib/types";

import { ZoomControls } from "./board/zoom-controls";
import Canvas from "./canvas";
import ChatPanel from "./chat-panel";
import Navbar from "./Navbar";
import { BoardProvider, useBoardContext } from "./providers/board-provider";
import ToolBar from "./toolbar";

interface WhiteboardProps {
  boardData: typeof boards.$inferSelect;
}

function WhiteboardContent() {
  const {
    boardName,
    activeTool,
    setActiveTool,
    currentColor,
    setCurrentColor,
    scale,
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useBoardContext();

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar boardName={boardName} />

        <div className="relative mt-16 flex flex-1 overflow-hidden">
          <ZoomControls />

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

export default function Whiteboard({ boardData }: WhiteboardProps) {
  return (
    <BoardProvider boardName={boardData.name}>
      <WhiteboardContent />
    </BoardProvider>
  );
}
