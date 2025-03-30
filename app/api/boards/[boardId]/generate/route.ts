import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assuming your Drizzle instance is exported from here
import { boardMembers, boardElements } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
// import { auth } from "@/auth"; // TODO: Uncomment and implement auth check

// Import the Gemini service function
import { generateTripPlan } from "@/services/geminiService";
// TODO: Import aiOutputs schema if saving results
// import { aiOutputs } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ boardId: string }> } // params is a Promise
) {
  try {
    const params = await paramsPromise; // Await the params
    const boardId = params.boardId;

    if (!boardId) {
      // Return JSON response
      return NextResponse.json({ message: "Board ID missing" }, { status: 400 });
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

    console.log(`Fetching elements for board: ${boardId}...`);

    // 3. Fetch Board Content (Example: Sticky notes and text elements)
    const elements = await db
      .select({
          id: boardElements.id,
          type: boardElements.type,
          data: boardElements.data,
          x: boardElements.x,
          y: boardElements.y,
          createdAt: boardElements.createdAt,
      })
      .from(boardElements)
      .where(
        and(
          eq(boardElements.boardId, boardId),
          inArray(boardElements.type, ["sticky", "text"])
         )
      )
      .orderBy(boardElements.createdAt);

    console.log(`Found ${elements.length} text elements on board ${boardId}`);

    if (elements.length === 0) {
      return NextResponse.json({ 
        message: "No text content found on the canvas to analyze.",
        details: "Add some text or sticky notes to generate a trip plan."
      }, { status: 400 });
    }

      console.log(`Fetched ${elements.length} elements for board: ${boardId}`);
      console.log("Fetched elements from DB:", JSON.stringify(elements, null, 2)); // Log the actual elements found

     // 4. Format Content for Gemini
     console.log('Processing elements for Gemini analysis...');
     
     const processedElements = elements
       .filter(el => el.data && typeof el.data === 'string' && el.data.trim().length > 0)
       .map((el, index) => {
         // Clean and format each element's text
         const elementText = el.data!.trim();
         const elementType = el.type === 'sticky' ? 'Sticky Note' : 'Text Box';
         const position = `Position: (${el.x}, ${el.y})`;
         const timestamp = new Date(el.createdAt!).toISOString();
         
         return {
           index: index + 1,
           type: elementType,
           content: elementText,
           metadata: `${position} | Added: ${timestamp}`,
         };
       });

     console.log(`Processed ${processedElements.length} elements with content`);

     // Format the content as a structured travel planning document
     const boardContent = `
Travel Planning Board Content:
===========================
${processedElements.map(el => 
  `#${el.index}. ${el.type}
Content: ${el.content}
${el.metadata}
`).join('\n---\n')}
===========================

Please analyze these travel planning notes and preferences to suggest a suitable destination.
`.trim();

     console.log('Final formatted content:', boardContent);

    console.log(`Formatted content for Gemini:\n${boardContent}`);

    if (!boardContent.trim()) {
        // Return JSON response
        return NextResponse.json({ message: "No text content found on the canvas to analyze." }, { status: 400 });
    }

    // 5. Call Gemini Service
    const aiOutput = await generateTripPlan(boardContent); // Pass formatted content

    // TODO: 6. Save AI Output to DB (Optional but recommended)
    // Consider adding a try/catch block around this if you implement it
    // await db.insert(aiOutputs).values({
    //   ...aiOutput,
    //   boardId: boardId,
    //   createdAt: new Date(), // Use Date object
    // });
    // console.log(`AI output saved for board: ${boardId}`);

    // 7. Return Success Response with AI Output
    return NextResponse.json({ message: "Trip plan generated successfully.", data: aiOutput }, { status: 200 });

  } catch (error) {
    console.error("[BOARD_GENERATE_API_ERROR]", error);
    // Return JSON response for errors too
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
