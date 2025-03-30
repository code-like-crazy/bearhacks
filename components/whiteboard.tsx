"use client";

import { useEffect } from "react";
import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";

import { type boards } from "@/lib/db/schema";
import { RoomProvider } from "@/lib/liveblocks.config";
import type { ToolType } from "@/lib/types";

import { ZoomControls } from "./board/zoom-controls";
import LiveCanvas from "./canvas/LiveCanvas";
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
  } = useBoardContext();

  // Update cursor based on active tool
  useEffect(() => {
    const cursor = isDragging
      ? "grabbing"
      : activeTool === "select"
        ? "grab"
        : "default";
    document.body.style.cursor = cursor;

    return () => {
      document.body.style.cursor = "default";
    };
  }, [isDragging, activeTool]);

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-black">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar boardName={boardName} />

        <div className="relative mt-16 flex max-h-[calc(100vh-150px)] flex-1 overflow-hidden">
          <ZoomControls />

          <div className="relative flex-1 overflow-hidden">
            <RoomProvider
              id={`board-${boardName}`}
              initialPresence={{
                cursor: null,
                selection: null,
              }}
              initialStorage={{
                canvasObjects: new LiveMap(),
              }}
            >
              <ClientSideSuspense fallback={<div>Loading...</div>}>
                {() => (
                  <LiveCanvas
                    boardId={boardName}
                    activeTool={activeTool}
                    currentColor={currentColor}
                    scale={scale}
                    position={position}
                    setActiveTool={setActiveTool}
                  />
                )}
              </ClientSideSuspense>
            </RoomProvider>
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
