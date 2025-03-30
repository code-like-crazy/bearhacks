"use client";

import { SelectBoard } from "@/lib/db/schema";

import { BoardCard } from "./BoardCard";

export type BoardWithCreator = SelectBoard & { creatorName?: string };

interface BoardGridClientProps {
  initialBoards: BoardWithCreator[];
  initialError?: string | null; // Pass error state from server
}

export default function BoardGridClient({
  initialBoards,
  initialError,
}: BoardGridClientProps) {
  if (initialError) {
    return (
      <div className="border-destructive bg-destructive/10 text-destructive mt-6 rounded-md border p-4 text-center">
        <p>{initialError}</p>
      </div>
    );
  }

  if (initialBoards.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <span className="text-6xl">🌍</span>
        <h3 className="mt-4 text-xl font-semibold text-slate-800">
          No boards yet!
        </h3>
        <p className="mt-2 text-slate-600">
          Create one to start planning your next adventure.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
      {initialBoards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
