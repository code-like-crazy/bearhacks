"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createBoard } from "@/services/actions/boards/create-board";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createBoardSchema } from "@/lib/validations/board";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const avatarImages = [
  "bear.jpg",
  "bear2.jpg",
  "bee.jpg",
  "cat.jpg",
  "cat2.jpg",
  "dog.jpg",
  "dog2.jpg",
  "dragon.jpg",
  "pink-panther.jpg",
  "porcupine.jpg",
  "unicorn.jpg",
];

type CreateBoardFormValues = z.infer<typeof createBoardSchema>;

const CreateBoardModal = () => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      inviteCode: "",
      selectedImage: "",
    },
  });

  const onSubmit = (values: CreateBoardFormValues) => {
    startTransition(async () => {
      try {
        const response = await createBoard(
          values.name,
          values.selectedImage,
          values.inviteCode,
        );

        if (response.error) {
          toast.error(response.error);
          return;
        }

        toast.success(response.message);
        setIsOpen(false);
        form.reset();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error creating board: ", error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Board</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create a New Board
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Board Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My Amazing Board"
                      className="h-12"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Select Board Image</FormLabel>
                  <div className="grid max-h-[300px] grid-cols-3 gap-4 overflow-y-auto rounded-lg border p-2 sm:grid-cols-4">
                    {avatarImages.map((image) => (
                      <div
                        key={image}
                        className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 bg-black transition hover:opacity-75 ${
                          field.value === `/avatars/${image}`
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-transparent"
                        }`}
                        onClick={() => field.onChange(`/avatars/${image}`)}
                      >
                        <Image
                          src={`/avatars/${image}`}
                          alt={image}
                          fill
                          className="object-cover select-none"
                          sizes="128px"
                        />
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">
                    Custom Invite Code (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., FUNBOARD"
                      className="h-12"
                      disabled={isPending}
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-sm">
                    Your invite code will be used to join the board. A random
                    invite code will be generated if you leave it blank.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full text-lg"
              disabled={isPending}
            >
              {isPending ? "Creating Board..." : "Create Board"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardModal;
