"use server";

import { getAllUserBoards } from "@/services/board";
import { getUserById } from "@/services/user";

import { SelectBoard } from "@/lib/db/schema";

interface BoardWithCreator extends SelectBoard {
  creatorName: string;
}

export const getRecentBoards = async (limit: number = 5) => {
  let boards: BoardWithCreator[] = [];
  let error: string | null = null;

  try {
    const fetchedBoards = await getAllUserBoards();

    if (fetchedBoards === null) {
      error = "Could not fetch boards. Are you logged in?";
    } else if (fetchedBoards.length > 0) {
      // Create a Map to store unique boards by ID
      const uniqueBoards = new Map<string, SelectBoard>();

      // Keep only the most recent occurrence of each board
      fetchedBoards.forEach((board) => {
        if (!uniqueBoards.has(board.id)) {
          uniqueBoards.set(board.id, board);
        }
      });

      // Convert Map back to array and get the latest boards
      const latestBoards = Array.from(uniqueBoards.values())
        .sort((a, b) => {
          const timeA = a.createdAt ?? 0;
          const timeB = b.createdAt ?? 0;
          return timeB - timeA;
        })
        .slice(0, limit);

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

  return { boards, error };
};
