"server only";

import { getCurrentUser } from "@/auth";
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardMembers, boards } from "@/lib/db/schema";

export const getAllUserBoards = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const userBoards = await db
      .selectDistinct()
      .from(boards)
      .leftJoin(boardMembers, eq(boards.id, boardMembers.boardId))
      .where(
        or(eq(boards.creatorId, user.id), eq(boardMembers.userId, user.id)),
      );

    // Map to return just the board data
    return userBoards.map(({ boards }) => boards);
  } catch (error) {
    console.error(
      "Error fetching user boards in getAllUserBoards function: ",
      error,
    );
    return null;
  }
};

export const getBoardById = async (id: string) => {
  try {
    const board = await db.select().from(boards).where(eq(boards.id, id));
    return board[0];
  } catch (error) {
    console.error("Error fetching board in getBoardById function: ", error);
    return null;
  }
};

export const joinBoardById = async (boardId: string, userId: string) => {
  try {
    await db.insert(boardMembers).values({
      boardId: boardId,
      userId: userId,
    });
  } catch (error) {
    console.error("Error joining board in joinBoardById function: ", error);
    throw error;
  }
};
