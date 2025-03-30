"use client";

import { useState } from "react";
import { MoreHorizontal, Share2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DeleteBoardModal } from "../modals/DeleteBoardModal";
import ShareBoardModal from "../modals/ShareBoardModal";
import type { BoardWithCreator } from "./BoardGridClient";

type BoardCardDropdownProps = {
  board: BoardWithCreator;
};

export function BoardCardDropdown({ board }: BoardCardDropdownProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative z-20 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Board options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="relative z-20">
          <ShareBoardModal
            board={board}
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              setIsDeleteDialogOpen(true);
            }}
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteBoardModal
        board={board}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
