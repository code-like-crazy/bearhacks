"use server";

import { signIn as authSignIn } from "@/auth";
import { getAllUserBoards } from "@/services/board";

import { SignInRequest } from "@/lib/validations/auth";

export const signIn = async (values: SignInRequest) => {
  try {
    await authSignIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    // Check if the user is part of any boards
    const userBoards = await getAllUserBoards();

    if (!userBoards?.length) {
      return {
        success: true,
        redirectTo: "/home",
      };
    }

    // Redirect to the first board in their list
    return {
      success: true,
      redirectTo: `/board/${userBoards[0].id}`,
    };
  } catch (error) {
    console.log("Error in signIn function:", error);

    const err = error as Error;

    if (err.message.includes("CredentialsSignin")) {
      return {
        error: "Invalid credentials",
      };
    }

    return {
      error: "Something went wrong. Please try again later.",
    };
  }
};
