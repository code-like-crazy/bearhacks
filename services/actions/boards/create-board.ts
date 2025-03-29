"use server";

import { getCurrentUser } from "@/auth";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import { boardMembers, boards } from "@/lib/db/schema";

export const createBoard = async (
  name: string,
  imageUrl: string,
  inviteCode?: string,
) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: "You must be logged in to create a board.",
      };
    }

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: nanoid(),
        name,
        imageUrl,
        inviteCode: inviteCode ?? nanoid().slice(0, 6),
        creatorId: user.id,
        createdAt: Date.now(),
      })
      .returning();

    await db
      .insert(boardMembers)
      .values({
        boardId: newBoard.id,
        userId: user.id,
      })
      .catch(() => {
        return {
          error:
            "Could not join board as creator. Please delete the board and try again.",
        };
      });

    return {
      success: true,
      message: "Board created successfully.",
    };
  } catch (error) {
    return {
      error: "Something went wrong. Please try again later.",
    };
  }
};
