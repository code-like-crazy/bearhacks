"use client";

import { PlusCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const recentBoards = [
    {
      id: 1,
      name: "Seoul",
      active: true,
      user: { name: "Alex", image: "/placeholder.svg?height=24&width=24" },
    },
    {
      id: 2,
      name: "Paris, Barcelona...",
      active: false,
      user: { name: "Jamie", image: "/placeholder.svg?height=24&width=24" },
    },
    {
      id: 3,
      name: "Tokyo Trip",
      active: false,
      user: { name: "Taylor", image: "/placeholder.svg?height=24&width=24" },
    },
  ];

  return (
    <div className="bg-background flex h-full w-64 flex-col border-r">
      <div className="p-4">
        <Button className="mb-2 w-full justify-start" variant="outline">
          Join a board
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create a board
        </Button>
      </div>

      <div className="px-4 py-2">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          RECENT BOARDS
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        <nav className="grid gap-1 px-2">
          {recentBoards.map((board) => (
            <Button
              key={board.id}
              variant={board.active ? "secondary" : "ghost"}
              className="h-10 justify-start px-2"
              asChild
            >
              <a href="#" className="flex items-center gap-2">
                <div
                  className={`h-5 w-1 rounded-full ${board.active ? "bg-primary" : "bg-transparent"}`}
                />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={board.user.image} alt={board.user.name} />
                  <AvatarFallback>{board.user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="truncate">{board.name}</span>
              </a>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
