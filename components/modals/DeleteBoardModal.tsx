"use client";

import { useState, useTransition } from "react";
import { deleteBoard } from "@/services/actions/boards/delete-board";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { BoardWithCreator } from "../dashboard/BoardGridClient";

type DeleteBoardModalProps = {
  board: BoardWithCreator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteBoardModal({
  board,
  open,
  onOpenChange,
}: DeleteBoardModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteBoard(board.id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(`Board "${board.name}" deleted.`);
        }
      } catch (error) {
        toast.error("Failed to delete board. Please try again.");
        console.error("Delete board error:", error);
      } finally {
        onOpenChange(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the board
            "{board.name}" and all its contents.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
