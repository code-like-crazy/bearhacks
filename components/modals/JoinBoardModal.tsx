"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface JoinBoardModalProps {
  trigger?: React.ReactNode;
}

const springConfig = {
  type: "spring",
  stiffness: 500,
  damping: 25,
};

const JoinBoardModal = ({ trigger }: JoinBoardModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="secondary">Join Board</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Friend&apos;s Board</DialogTitle>
        </DialogHeader>

        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
        >
          <p className="text-muted-foreground text-sm">
            Ask your friends to share their board&apos;s invite link or code
            with you. You&apos;ll need this to join their travel planning group.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#3b82f6] hover:bg-[#3b82f6]/90"
            >
              Okay
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinBoardModal;
