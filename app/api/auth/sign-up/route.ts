import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/services/user";
import bcrypt from "bcryptjs";

import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedFields = registerSchema.safeParse(body);

    if (!validatedFields.success) {
      // Debug log
      console.log("Validation failed:", validatedFields.error.flatten());

      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password, name } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        {
          error: "This email is already registered.",
          fieldErrors: {
            email: ["An account with this email already exists."],
          },
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await createUser(email, hashedPassword, name);
    } catch (error) {
      console.log("oh nooo");
    }

    return NextResponse.json(
      { success: true, message: "Account created successfully." },
      { status: 201 },
    );
  } catch (error) {
    console.error("ERROR IN SIGN-UP ROUTE: ", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
