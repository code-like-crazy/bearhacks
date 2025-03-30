"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { BoardCardDropdown } from "./BoardCardDropdown";
import type { BoardWithCreator } from "./BoardGridClient";

type BoardCardProps = {
  board: BoardWithCreator;
};

export function BoardCard({ board }: BoardCardProps) {
  const createdAt = board.createdAt
    ? new Date(board.createdAt * 1000)
    : new Date();
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-lg">
      <Link
        href={`/board/${board.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View board ${board.name}`}
      />
      <CardHeader className="relative z-10 flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">
          <Link href={`/board/${board.id}`} className="hover:underline">
            {board.name}
          </Link>
        </CardTitle>
        <BoardCardDropdown board={board} />
      </CardHeader>

      <CardContent className="relative z-10 flex-grow pb-4">
        {/* Collaborator Avatars would go here */}
      </CardContent>

      <CardFooter className="relative z-10 flex justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs">
        <span className="text-slate-600">
          Created by {board.creatorName || "..."}
        </span>
        <span className="text-slate-500">{timeAgo}</span>
      </CardFooter>
    </Card>
  );
}
