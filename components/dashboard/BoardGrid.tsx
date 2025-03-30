import { Suspense } from "react";
import { getAllUserBoards } from "@/services/board";
import { getUserById } from "@/services/user";

import { SelectBoard } from "@/lib/db/schema";

import { BoardCardSkeleton } from "./BoardCardSkeleton";
import BoardGridClient, { BoardWithCreator } from "./BoardGridClient";

// Server Component to fetch data
async function BoardDataFetcher() {
  let boards: BoardWithCreator[] = [];
  let error: string | null = null;

  try {
    const fetchedBoards = await getAllUserBoards();

    if (fetchedBoards === null) {
      // Handle case where user is not logged in or another issue occurred
      error = "Could not fetch boards. Are you logged in?";
    } else if (fetchedBoards.length > 0) {
      // Fetch creator names only if boards exist
      boards = await Promise.all(
        fetchedBoards.map(async (board: SelectBoard) => {
          try {
            const creator = await getUserById(board.creatorId);
            return { ...board, creatorName: creator?.name || "Unknown" };
          } catch (userError) {
            console.error(
              `[BoardGrid Server] Failed to fetch user ${board.creatorId}`,
              userError,
            );
            return { ...board, creatorName: "Unknown" };
          }
        }),
      );
    }
    // If fetchedBoards is an empty array, boards remains [], error remains null
  } catch (err) {
    console.error("[BoardGrid Server] Failed to fetch boards:", err);
    error = "Couldn't load boards. Please try again later.";
    boards = []; // Ensure boards is empty on error
  }

  // Pass fetched data or error to the client component
  return <BoardGridClient initialBoards={boards} initialError={error} />;
}

// Skeleton loader for Suspense fallback
function BoardGridLoadingSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
      {[...Array(4)].map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Main export using Suspense for loading state
export default function BoardGrid() {
  return (
    <Suspense fallback={<BoardGridLoadingSkeleton />}>
      <BoardDataFetcher />
    </Suspense>
  );
}
