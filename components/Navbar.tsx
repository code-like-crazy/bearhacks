import { Edit2, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Props = {
  boardName?: string; // Make boardName optional or provide a default
  activeUsers?: { src: string; fallback: string }[]; // Array of user avatars
};

const Navbar = ({
  boardName = "Board_Name",
  activeUsers = [
    { src: "/avatars/cat.jpg", fallback: "U1" },
    { src: "/avatars/dog.jpg", fallback: "U2" },
    { src: "/avatars/cat2.jpg", fallback: "U3" },
  ],
}: Props) => {
  return (
    <nav className="fixed z-50 flex h-16 items-center justify-between overflow-x-hidden border-b bg-white px-4 lg:w-[calc(100%-288px)]">
      {/* Left Section: Board Name */}
      <button className="group flex cursor-pointer items-center gap-2 border-b text-lg font-semibold transition-colors hover:border-zinc-600">
        <p>{boardName}</p>
        <Edit2 className="text-muted-foreground group-hover:text-foreground 5 size-4 transition-colors" />
      </button>

      <div className="flex items-center gap-4 md:gap-8">
        {/* active users */}
        <div className="flex items-center gap-2">
          {activeUsers.map((user, index) => (
            <Avatar key={index} className="size-8 border-2 border-rose-400">
              <AvatarImage src={user.src} />
              <AvatarFallback>{user.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/*  buttons */}
        <div className="flex w-fit items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="w-28 bg-[#7176F7] hover:bg-indigo-500"
          >
            Share
          </Button>
          <Button
            variant="default"
            size="sm"
            className="w-28 bg-[#7176F7] hover:bg-indigo-500"
          >
            Templates
          </Button>
          <Button
            variant="default"
            size="sm"
            className="w-32 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
