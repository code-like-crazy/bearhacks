"use client";

import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignOutButton from "@/components/auth/SignOutButton";

type UserSession = {
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl: string;
  };
};

const SidebarUser = () => {
  const { data: session } = useSession() as { data: UserSession | null };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={session.user.imageUrl || "/placeholder-user.jpg"}
            />
            <AvatarFallback>
              {session.user.name?.[0] || session.user.email?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {session.user.email}
            </p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
};

export default SidebarUser;
