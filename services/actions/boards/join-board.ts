"use server";

import { getCurrentUser } from "@/auth";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { boardMembers, boards } from "@/lib/db/schema";

export const joinBoard = async (boardId: string, inviteCode: string) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: "You must be logged in to join a board.",
      };
    }

    const [existingBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    if (!existingBoard) {
      return {
        error: "Board not found.",
      };
    }

    await db
      .insert(boardMembers)
      .values({
        boardId: boardId,
        userId: user.id,
      })
      .catch(() => {
        return {
          error: "Failed to join board, you may already be a member.",
        };
      });

    return {
      success: true,
      message: `You're now a member of board "${existingBoard.name}"`,
    };
  } catch (error) {
    return {
      error: "Something went wrong. Please try again later.",
    };
  }
};
