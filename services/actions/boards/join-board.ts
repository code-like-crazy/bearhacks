"use server";

import { getCurrentUser } from "@/auth";
import { getBoardById, joinBoardById } from "@/services/board";

export const joinBoard = async (boardId: string, inviteCode: string) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: "You must be logged in to join a board.",
      };
    }

    const existingBoard = await getBoardById(boardId);

    if (!existingBoard) {
      return {
        error: "Board not found.",
      };
    }

    if (existingBoard.inviteCode !== inviteCode) {
      console.error(
        `User "${user.name}" tried to join board "${existingBoard.name}" with an invalid invite code.`,
      );

      return {
        error: "Invalid invite code or board does not exist.",
      };
    }

    await joinBoardById(boardId, user.id).catch(() => {
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
