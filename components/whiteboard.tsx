"use client";

import { useEffect, useRef, useState } from "react"; // Import useState, useRef
import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react";

import { type boards } from "@/lib/db/schema";
import { RoomProvider } from "@/lib/liveblocks.config";
import type { ToolType } from "@/lib/types";

import { ZoomControls } from "./board/zoom-controls";
import LiveCanvas, { LiveCanvasRef } from "./canvas/LiveCanvas"; // Import LiveCanvasRef
import ChatPanel from "./chat-panel";
import Navbar from "./Navbar";
import { BoardProvider, useBoardContext } from "./providers/board-provider";
import ToolBar from "./toolbar";

interface WhiteboardProps {
  boardData: typeof boards.$inferSelect;
}

function WhiteboardContent() {
  const liveCanvasRef = useRef<LiveCanvasRef>(null); // Ref for LiveCanvas methods
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null); // Add state for Gemini response
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
    let cursor = "default";

    if (isDragging) {
      cursor = "grabbing";
    } else if (activeTool === "select") {
      cursor = "default";
    } else if (activeTool === "grab") {
      cursor = "grab";
    }

    document.body.style.cursor = cursor;

    return () => {
      document.body.style.cursor = "default";
    };
  }, [isDragging, activeTool]);

  const handleToolChange = (tool: ToolType) => {
    // If shapes is selected, default to rectangle
    if (tool === "shapes") {
      setActiveTool("rectangle");
      return;
    }
    setActiveTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setActiveTool("select");
  };

  // Function to trigger generation in LiveCanvas
  const handleGenerateClick = () => {
    liveCanvasRef.current?.triggerGeneration();
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#F5F5F5]">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Pass handleGenerateClick to Navbar */}
        <Navbar boardName={boardName} onGenerateClick={handleGenerateClick} />

        <div className="relative mt-16 flex h-[calc(100svh-64px)] flex-1 overflow-hidden">
          <div className="relative flex-1 overflow-hidden">
            <ZoomControls />
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
                    ref={liveCanvasRef} // Assign the ref
                    boardId={boardName}
                    activeTool={activeTool}
                    currentColor={currentColor}
                    scale={scale}
                    position={position}
                    setActiveTool={setActiveTool}
                    onGeminiResponse={setGeminiResponse} // Pass the state setter function
                  />
                )}
              </ClientSideSuspense>
            </RoomProvider>
          </div>
          <ChatPanel geminiResponse={geminiResponse} />{" "}
          {/* Pass state to ChatPanel */}
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
