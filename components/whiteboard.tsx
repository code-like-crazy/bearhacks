"use client";

import { useEffect, useRef, useState } from "react";
import { LiveList, LiveMap } from "@liveblocks/client";
import { ClientSideSuspense, LiveblocksProvider } from "@liveblocks/react";

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

function WhiteboardContent({ boardData }: WhiteboardProps) {
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
          <LiveblocksProvider
            publicApiKey={
              "pk_dev_rMt1qhur35pmoK4T3aW1u_PRhLoudsvMX6dhFAh_aeohjLsyYqt93LDl_aBqdpoa"
            }
          >
            <RoomProvider
              id={`board-${boardData.id}`}
              initialPresence={{
                cursor: null,
                selection: null,
              }}
              initialStorage={{
                canvasObjects: new LiveMap(),
                chatMessages: new LiveList([]),
              }}
            >
              <ClientSideSuspense fallback={<div>Loading...</div>}>
                {() => (
                  <>
                    <div className="relative flex-1 overflow-hidden">
                      <ZoomControls />
                      <LiveCanvas
                        boardId={boardData.id}
                        activeTool={activeTool}
                        currentColor={currentColor}
                        scale={scale}
                        position={position}
                        setActiveTool={setActiveTool}
                      />
                    </div>
                    <ChatPanel geminiResponse={geminiResponse} />
                  </>
                )}
              </ClientSideSuspense>
            </RoomProvider>
          </LiveblocksProvider>
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
      <WhiteboardContent boardData={boardData} />
    </BoardProvider>
  );
}
