"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRecentBoards } from "@/services/actions/boards/get-recent-boards";

import { SelectBoard } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface BoardWithCreator extends SelectBoard {
  creatorName: string;
}

export function RecentBoardsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(5)].map((_, i) => (
        <Card
          key={i}
          className="animate-pulse border-none bg-gray-100 shadow-none"
        >
          <CardContent className="h-8 px-3 py-1" />
        </Card>
      ))}
    </div>
  );
}

export default function RecentBoards() {
  const pathname = usePathname();
  const [boards, setBoards] = useState<BoardWithCreator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    const { boards, error } = await getRecentBoards();
    setBoards(boards);
    setError(error);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (loading) {
    return <RecentBoardsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-muted-foreground text-center text-sm">{error}</div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="mt-4 rounded-lg border p-3 text-sm">
        <p className="mb-2">No recent boards.</p>
        <p className="font-normal">Create one or join an existing board!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {boards.map((board) => {
        const isActive = pathname === `/board/${board.id}`;

        return (
          <Link key={board.id} href={`/board/${board.id}`} className="">
            <div className={cn("group relative px-2 transition duration-200")}>
              <div
                className={cn(
                  "absolute inset-y-1 left-0 w-[3px] rounded-full bg-transparent transition group-hover:bg-indigo-100",
                  {
                    "bg-indigo-400 group-hover:bg-indigo-500": isActive,
                  },
                )}
              />
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1 transition-colors",
                  {
                    "bg-gray-100": isActive,
                  },
                )}
              >
                <div className="relative size-8">
                  <Image
                    src="/avatars/cat.jpg"
                    alt="Member avatar"
                    width={20}
                    height={20}
                    className="absolute top-1/2 left-1/2 -translate-x-3.5 -translate-y-3.5 rounded-full object-cover"
                  />
                  <Image
                    src="/avatars/bear.jpg"
                    alt="Member avatar"
                    width={20}
                    height={20}
                    className="absolute top-1/2 left-1/2 -translate-x-1.5 -translate-y-1.5 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="truncate text-black">{board.name}</h3>
                  <p className="text-muted-foreground text-[10px]">
                    Created by {board.creatorName}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
