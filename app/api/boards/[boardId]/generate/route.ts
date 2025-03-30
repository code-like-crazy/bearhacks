import { NextResponse } from "next/server";
// import { auth } from "@/auth"; // TODO: Uncomment and implement auth check

// Import the Gemini service function
import { generateTripPlan } from "@/services/geminiService";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db"; // Assuming your Drizzle instance is exported from here
import { boardElements } from "@/lib/db/schema";

// TODO: Import aiOutputs schema if saving results
// import { aiOutputs } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ boardId: string }> }, // params is a Promise
) {
  try {
    const params = await paramsPromise; // Await the params
    const boardId = params.boardId;

    if (!boardId) {
      // Return JSON response
      return NextResponse.json(
        { message: "Board ID missing" },
        { status: 400 },
      );
    }

    // TODO: 1. Authentication & Authorization
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }
    // const userId = session.user.id;

    // // Check if user is a member of the board (Authorization)
    // const membership = await db.query.boardMembers.findFirst({
    //   where: and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId)),
    // });
    // if (!membership) {
    //    return new NextResponse("Forbidden: User is not a member of this board", { status: 403 });
    // }

    console.log(`Generate request received for board: ${boardId}`);

    // --- TEMPORARILY DISABLED FOR TESTING GENERATION FLOW ---
    // // 2. Readiness Check
    // const members = await db
    //   .select({ isLocked: boardMembers.isLocked })
    //   .from(boardMembers)
    //   .where(eq(boardMembers.boardId, boardId));

    // if (!members || members.length === 0) {
    //    // Return JSON response for consistency
    //    return NextResponse.json({ message: "No members found for this board" }, { status: 404 });
    // }
    //
    // // Removed the check for allReady = members.every(...)
    // // const allReady = members.every((member) => member.isLocked === 1);
    // //
    // // if (!allReady) {
    // //   console.log(`Board ${boardId} not ready. Members status:`, members);
    // //   return NextResponse.json(
    // //     { message: "All members must lock in before generating the trip." },
    // //     { status: 400 } // Bad Request might be more appropriate than Forbidden
    // //   );
    // // }
    // --- END TEMPORARY DISABLE ---

    // 3. Fetch Board Content (Example: Sticky notes and text elements)
    const elements = await db
      .select({
        id: boardElements.id,
        type: boardElements.type,
        data: boardElements.data, // Assuming data contains text for sticky/text
      })
      .from(boardElements)
      .where(
        and(
          eq(boardElements.boardId, boardId),
          // Add more types if needed
          eq(boardElements.type, "sticky"), // Or use `inArray` for multiple types
          // eq(boardElements.type, "text")
        ),
      );

    console.log(`Fetched ${elements.length} elements for board: ${boardId}`);

    // TODO: 4. Format Content for Gemini
    // Extract text/content from elements.data (needs parsing based on your data structure)
    const boardContent = elements
      .map((el) => {
        try {
          const parsedData = JSON.parse(el.data || "{}");
          return parsedData.text || ""; // Adjust based on actual data structure
        } catch (e) {
          console.error(`Failed to parse data for element ${el.id}:`, el.data);
          return "";
        }
      })
      .filter((text) => text)
      .join("\n---\n"); // Simple joining for now

    console.log(`Formatted content for Gemini:\n${boardContent}`);

    if (!boardContent.trim()) {
      // Return JSON response
      return NextResponse.json(
        { message: "No text content found on the canvas to analyze." },
        { status: 400 },
      );
    }

    // 5. Call Gemini Service
    const aiOutput = await generateTripPlan(boardContent); // Pass formatted content

    // TODO: 7. Return Success Response (Placeholder)
    return NextResponse.json(
      {
        message: "Generation started (placeholder)",
        boardContent: boardContent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[BOARD_GENERATE_API_ERROR]", error);
    // Return JSON response for errors too
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
