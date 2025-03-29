"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";

const deleteBoardSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
});

export async function deleteBoard(
  boardId: string,
): Promise<{ error?: string; message?: string }> {
  const validation = deleteBoardSchema.safeParse({ boardId });
  if (!validation.success) {
    return {
      error:
        "Invalid input: " +
        validation.error.flatten().fieldErrors.boardId?.join(", "),
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized: You must be logged in to delete a board." };
  }

  try {
    // Verify the user is the creator of the board before deleting
    const boardToDelete = await db
      .select({ id: boards.id })
      .from(boards)
      .where(
        and(
          eq(boards.id, validation.data.boardId),
          eq(boards.creatorId, user.id),
        ),
      )
      .limit(1);

    if (boardToDelete.length === 0) {
      return {
        error:
          "Forbidden: You can only delete boards you created or board not found.",
      };
    }

    // Perform the deletion
    await db.delete(boards).where(eq(boards.id, validation.data.boardId));

    // Revalidate the path to update the UI
    revalidatePath("/(main)/(dashboard)/home"); // Revalidate the home page where boards are listed

    return { message: "Board deleted successfully." };
  } catch (error) {
    console.error("Error deleting board:", error);
    return { error: "Database error: Failed to delete the board." };
  }
}
