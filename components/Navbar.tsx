import { Edit2, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  boardName: string;
  collaborators?: {
    id: number;
    name: string;
    image: string;
  }[];
}

const Navbar = ({
  boardName,
  collaborators = [
    { id: 1, name: "Alex", image: "/avatars/cat.jpg" },
    { id: 2, name: "Jamie", image: "/avatars/dog.jpg" },
    { id: 3, name: "Taylor", image: "/avatars/cat2.jpg" },
  ],
}: NavbarProps) => {
  return (
    <nav className="fixed z-50 flex h-16 items-center justify-between overflow-x-hidden border-b bg-white px-4 lg:w-[calc(100%-288px)]">
      {/* Left Section: Board Name */}
      <button className="group flex cursor-pointer items-center gap-2 border-b text-lg font-semibold transition-colors hover:border-zinc-600">
        <p>{boardName}</p>
        <Edit2 className="text-muted-foreground group-hover:text-foreground 5 size-4 transition-colors" />
      </button>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          {collaborators.map((user) => (
            <Avatar key={user.id} className="size-8 border-2 border-rose-400">
              <AvatarImage src={user.image} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
