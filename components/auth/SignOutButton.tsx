"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

const SignOutButton = ({ className }: { className?: string }) => {
  return (
    <button
      onClick={() =>
        signOut({
          redirectTo: "/",
        })
      }
      className={cn(
        "flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/20",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
};
export default SignOutButton;
