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
      const latestBoards = fetchedBoards.slice(0, limit);
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
