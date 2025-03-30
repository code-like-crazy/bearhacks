"use client";

import { ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useBoardContext } from "../providers/board-provider";

export function ZoomControls() {
  const { handleZoomIn, handleZoomOut } = useBoardContext();

  return (
    <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
      <Button size="icon" variant="outline" onClick={handleZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={handleZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
