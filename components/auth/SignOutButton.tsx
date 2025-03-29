"use client";

import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

const SignOutButton = ({ className }: { className?: string }) => {
  return (
    <button onClick={() => signOut({})} className={cn("", className)}>
      Sign Out
    </button>
  );
};
export default SignOutButton;
