import { generateTripPlan } from "@/services/geminiService";
import { NextResponse } from "next/server";

export async function GET() {
  const boardContent = "I want to go to Tokyo from 2024-03-15 to 2024-03-22 and stay in a 5 star hotel";
  const result = await generateTripPlan(boardContent);
  return NextResponse.json({ result });
}
