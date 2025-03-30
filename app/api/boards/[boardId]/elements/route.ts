import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { boardElements } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth"; // Assuming auth setup provides user ID

// Define the expected shape of the request body
interface ElementData {
  id: string;
  type: string;
  data: string | null; // Data might be null
  x: number;
  y: number;
}

export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ boardId: string }> }
) {
  try {
    const params = await paramsPromise;
    const boardId = params.boardId;
    const body = await request.json();
    const elementData = body as ElementData; // Type assertion

    console.log(`POST request received for element ${elementData?.id} in board ${boardId}`);
    console.log("Element data:", elementData);

    if (!boardId) {
      console.log("Missing board ID");
      return NextResponse.json({ message: "Board ID missing" }, { status: 400 });
    }

    if (!elementData || !elementData.id || !elementData.type) {
      console.log("Invalid element data:", { elementData });
      return NextResponse.json({ message: "Invalid element data" }, { status: 400 });
    }

    // --- TODO: Authentication ---
    // Get user ID from session - IMPORTANT for setting creatorId
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }
    // const userId = session.user.id;
    // For now, using a placeholder - replace this!
    const userId = "placeholder_user_id";
    // --- End TODO ---


    console.log(`Upserting element ${elementData.id} for board ${boardId}`);

    // Perform an "upsert" operation: Insert or Update based on element ID
    await db
      .insert(boardElements)
      .values({
        id: elementData.id,
        boardId: boardId,
        creatorId: userId, // Use authenticated user ID
        type: elementData.type,
        data: typeof elementData.data === 'string' ? elementData.data : JSON.stringify(elementData.data),
        x: Math.round(elementData.x), // Ensure positions are integers
        y: Math.round(elementData.y),
        createdAt: Date.now(), // Use current timestamp for creation
        updatedAt: Date.now(), // Update timestamp on every upsert
      })
      .onConflictDoUpdate({
        target: boardElements.id, // Conflict target is the primary key 'id'
        set: {
          // Fields to update on conflict
          type: elementData.type,
          data: elementData.data,
          x: Math.round(elementData.x),
          y: Math.round(elementData.y),
          updatedAt: Date.now(),
          // Note: boardId and creatorId typically shouldn't change on update
        },
      });

    console.log(`Element ${elementData.id} saved successfully to board ${boardId}`);
    return NextResponse.json({ 
      message: "Element saved successfully",
      elementId: elementData.id,
      boardId,
      type: elementData.type
    }, { status: 200 });

  } catch (error) {
    console.error("[BOARD_ELEMENT_API_ERROR]", error);
    console.error("Error details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      message: "Internal Server Error saving element",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ boardId: string }> }
) {
  try {
    const params = await paramsPromise;
    const boardId = params.boardId;
    const body = await request.json();
    const elementId = body.id;

    console.log(`DELETE request received for element ${elementId} in board ${boardId}`);

    if (!boardId || !elementId) {
      console.log("Missing parameters:", { boardId, elementId });
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    // Delete the element from the database
    const result = await db
      .delete(boardElements)
      .where(and(
        eq(boardElements.boardId, boardId),
        eq(boardElements.id, elementId)
      ));

    console.log(`Element ${elementId} deleted successfully from board ${boardId}`);
    console.log("Delete result:", result);

    return NextResponse.json({ 
      message: "Element deleted successfully",
      elementId,
      boardId
    }, { status: 200 });

  } catch (error) {
    console.error("[BOARD_ELEMENT_DELETE_ERROR]", error);
    console.error("Error details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
