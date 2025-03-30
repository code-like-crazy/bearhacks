"use client";

import { useState, useTransition } from "react";
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
      <DialogContent className="px-8 sm:max-w-xl">
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
              <DialogTitle className="text-3xl font-bold">
                Create a New Board
              </DialogTitle>
            </motion.div>
          </DialogHeader>
          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-10 pt-4"
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
                          className="h-12 text-base"
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
                          className="h-12 text-base"
                          disabled={isPending}
                        />
                      </FormControl>
                      <p className="text-muted-foreground mt-2 text-sm">
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
