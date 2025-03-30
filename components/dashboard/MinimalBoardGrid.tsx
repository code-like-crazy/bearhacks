import { Suspense } from "react";
import Link from "next/link";
import { getAllUserBoards } from "@/services/board";
import { getUserById } from "@/services/user";

import { SelectBoard } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";

interface BoardWithCreator extends SelectBoard {
  creatorName: string;
}

async function MinimalBoardDataFetcher() {
  let boards: BoardWithCreator[] = [];
  let error: string | null = null;

  try {
    const fetchedBoards = await getAllUserBoards();

    if (fetchedBoards === null) {
      error = "Could not fetch boards. Are you logged in?";
    } else if (fetchedBoards.length > 0) {
      const latestBoards = fetchedBoards.slice(0, 3);
      boards = await Promise.all(
        latestBoards.map(async (board: SelectBoard) => {
          const creator = await getUserById(board.creatorId);
          return { ...board, creatorName: creator?.name || "Unknown" };
        }),
      );
    }
  } catch (err) {
    error = "Couldn't load boards. Please try again later.";
    boards = [];
  }

  if (error) {
    return <div className="text-muted-foreground text-center">{error}</div>;
  }

  if (boards.length === 0) {
    return (
      <div className="text-muted-foreground text-center">
        <p className="mb-2">You aren&apos;t part of any boards yet.</p>
        <p>Create one or ask a friend for an invite!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="mb-4 text-sm">Jump back in</p>
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        {boards.map((board) => (
          <Link key={board.id} href={`/board/${board.id}`} className="w-full">
            <Card className="hover:border-primary transition duration-200">
              <CardContent className="p-4">
                <h3 className="mb-1 truncate font-semibold">{board.name}</h3>
                <p className="text-muted-foreground text-sm">
                  Created by {board.creatorName}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MinimalBoardSkeleton() {
  return (
    <div className="mx-auto">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-[72px] p-4" />
        </Card>
      ))}
    </div>
  );
}

export default function MinimalBoardGrid() {
  return (
    <Suspense fallback={<MinimalBoardSkeleton />}>
      <MinimalBoardDataFetcher />
    </Suspense>
  );
}
