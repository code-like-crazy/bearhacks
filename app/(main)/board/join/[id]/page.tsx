"use client";

import { useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { joinBoard } from "@/services/actions/boards/join-board";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const joinBoardSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

type JoinBoardFormValues = z.infer<typeof joinBoardSchema>;

const springConfig = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const JoinBoardPage = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams();

  console.log("params:", params);
  const boardId = params.id;

  const form = useForm<JoinBoardFormValues>({
    resolver: zodResolver(joinBoardSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const onSubmit = (values: JoinBoardFormValues) => {
    startTransition(async () => {
      const response = await joinBoard(boardId as string, values.inviteCode);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response.message);
      router.push(`/board/${boardId}`);
    });
  };

  return (
    <main className="container flex min-h-[calc(100vh-5rem)] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="bg-card w-full max-w-lg space-y-8 rounded-lg border p-8 shadow-lg"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-3xl font-bold">Join Board</h1>
          <p className="text-muted-foreground">
            Enter the invite code to join this board
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springConfig, delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Invite Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter invite code"
                        className="h-12 text-base"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg"
                disabled={isPending}
              >
                {isPending ? "Joining Board..." : "Join Board"}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </main>
  );
};

export default JoinBoardPage;
