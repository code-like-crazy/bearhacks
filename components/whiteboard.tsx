"use client";

import { useEffect, useRef, useState } from "react";
import { LiveList, LiveMap } from "@liveblocks/client";
import { ClientSideSuspense, LiveblocksProvider } from "@liveblocks/react";

import { type boards } from "@/lib/db/schema";
import { RoomProvider } from "@/lib/liveblocks.config";
import type { ToolType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

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
              id={`my-=room`}
              initialPresence={{
                cursor: null,
                selection: null,
              }}
              initialStorage={{
                canvasObjects: new LiveMap(),
                chatMessages: new LiveList([]),
              }}
            >
              <ClientSideSuspense
                fallback={
                  <div className="flex h-full w-full flex-col">
                    {/* Navbar skeleton */}
                    <div className="bg-background absolute top-0 flex h-16 w-full items-center justify-between border-b px-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                    </div>

                    {/* Canvas area skeleton */}
                    <div className="relative mt-16 flex h-[calc(100svh-64px)] flex-1">
                      <div className="relative flex-1">
                        <Skeleton className="absolute top-4 right-4 h-24 w-10 rounded-lg" />
                        <div className="h-full w-full bg-[#F5F5F5]">
                          {/* Loading animation dots */}
                          <div className="flex h-full items-center justify-center">
                            <div className="space-x-2">
                              <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                              <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                              <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-gray-400"></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chat panel skeleton */}
                      <div className="bg-background w-80 border-l p-3">
                        <div className="space-y-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Toolbar skeleton */}
                    <div className="bg-background absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-lg border p-2 shadow-md">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                      ))}
                    </div>
                  </div>
                }
              >
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
      </div>
      <ToolBar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        currentColor={currentColor}
        onColorChange={handleColorChange}
      />
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
