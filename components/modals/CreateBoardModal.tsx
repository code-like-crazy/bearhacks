"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createBoard } from "@/services/actions/boards/create-board";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
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

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface CreateBoardModalProps {
  children?: React.ReactNode;
}

const CreateBoardModal = ({ children }: CreateBoardModalProps) => {
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
        {children || (
          <Button size="lg" className="font-semibold" variant="secondary">
            Create Board
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="text-2xl font-bold">
                Create a New Board
              </DialogTitle>
            </motion.div>
          </DialogHeader>
          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <motion.div variants={formItemVariants}>
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
              </motion.div>

              <motion.div variants={formItemVariants}>
                <FormField
                  control={form.control}
                  name="selectedImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">
                        Select Board Image
                      </FormLabel>
                      <div className="h-[300px] overflow-y-auto rounded-lg border p-4">
                        <motion.div
                          className="grid min-h-fit grid-cols-3 content-start gap-4 sm:grid-cols-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {avatarImages.map((image) => (
                            <motion.div
                              key={image}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className={`relative row-span-1 aspect-square cursor-pointer overflow-hidden rounded-lg border-2 bg-black transition hover:opacity-75 ${
                                field.value === `/avatars/${image}`
                                  ? "border-blue-500 ring-2 ring-blue-500"
                                  : "border-transparent"
                              }`}
                              onClick={() =>
                                field.onChange(`/avatars/${image}`)
                              }
                            >
                              <Image
                                src={`/avatars/${image}`}
                                alt={image}
                                fill
                                className="object-cover select-none"
                                sizes="128px"
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={formItemVariants}>
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
                        Your invite code will be used to join the board. A
                        random invite code will be generated if you leave it
                        blank.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                variants={formItemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg"
                  disabled={isPending}
                >
                  {isPending ? "Creating Board..." : "Create Board"}
                </Button>
              </motion.div>
            </motion.form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardModal;
