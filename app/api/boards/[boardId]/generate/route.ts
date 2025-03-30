import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assuming your Drizzle instance is exported from here
import { boardMembers, boardElements } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
// import { auth } from "@/auth"; // TODO: Uncomment and implement auth check

// Placeholder for Gemini service - we'll build this out later
// import { generateTripPlan } from "@/services/geminiService";

export async function POST(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const boardId = params.boardId;

    if (!boardId) {
      return new NextResponse("Board ID missing", { status: 400 });
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

    // 2. Readiness Check
    const members = await db
      .select({ isLocked: boardMembers.isLocked })
      .from(boardMembers)
      .where(eq(boardMembers.boardId, boardId));

    if (!members || members.length === 0) {
       return new NextResponse("No members found for this board", { status: 404 });
    }

    const allReady = members.every((member) => member.isLocked === 1);

    if (!allReady) {
      console.log(`Board ${boardId} not ready. Members status:`, members);
      return NextResponse.json(
        { message: "All members must lock in before generating the trip." },
        { status: 400 } // Bad Request might be more appropriate than Forbidden
      );
    }

    console.log(`All members ready for board: ${boardId}. Fetching elements...`);

    // 3. Fetch Board Content (Example: Sticky notes and text elements)
    const elements = await db
      .select({
          id: boardElements.id,
          type: boardElements.type,
          data: boardElements.data // Assuming data contains text for sticky/text
      })
      .from(boardElements)
      .where(
        and(
          eq(boardElements.boardId, boardId),
          // Add more types if needed
          eq(boardElements.type, "sticky") // Or use `inArray` for multiple types
          // eq(boardElements.type, "text")
        )
      );

     console.log(`Fetched ${elements.length} elements for board: ${boardId}`);

    // TODO: 4. Format Content for Gemini
    // Extract text/content from elements.data (needs parsing based on your data structure)
    const boardContent = elements.map(el => {
        try {
            const parsedData = JSON.parse(el.data || '{}');
            return parsedData.text || ''; // Adjust based on actual data structure
        } catch (e) {
            console.error(`Failed to parse data for element ${el.id}:`, el.data);
            return '';
        }
    }).filter(text => text).join('\n---\n'); // Simple joining for now

    console.log(`Formatted content for Gemini:\n${boardContent}`);

    // TODO: 5. Call Gemini Service
    // const aiOutput = await generateTripPlan(boardContent); // Pass formatted content

    // TODO: 6. Save AI Output to DB
    // await db.insert(aiOutputs).values({ ...aiOutput, boardId: boardId, createdAt: Date.now() });

    // TODO: 7. Return Success Response (Placeholder)
    return NextResponse.json({ message: "Generation started (placeholder)", boardContent: boardContent }, { status: 200 });

  } catch (error) {
    console.error("[BOARD_GENERATE_API_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
