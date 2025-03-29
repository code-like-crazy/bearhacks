"use client";

import { useState } from "react";
import { Check, Copy, Share } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { SelectBoard } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = { board: SelectBoard };

const springConfig = {
  type: "spring",
  stiffness: 500,
  damping: 25,
};

const ShareBoardModal = ({ board }: Props) => {
  // Track which button was recently clicked
  const [recentCopy, setRecentCopy] = useState<"link" | "code" | null>(null);

  const joinUrl =
    process.env.NODE_ENV === "development"
      ? `http://localhost:3000/board/join/${board.id}`
      : `TODO/board/join/${board.id}`;

  const playClickSound = () => {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1,
    );
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleCopy = async (text: string, type: "link" | "code") => {
    await navigator.clipboard.writeText(text);
    setRecentCopy(type);
    playClickSound();

    // Reset the copied state after animation
    setTimeout(() => {
      setRecentCopy(null);
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="transition-transform hover:scale-110 active:scale-[0.98]"
        >
          <Share className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{board.name}"</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Share this board with your friends to plan your trip together!
          </p>
        </DialogHeader>

        <motion.div
          className="flex flex-col gap-6 p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
        >
          <div className="space-y-4">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springConfig, delay: 0.1 }}
            >
              <label className="text-sm font-medium">Board Link</label>
              <div className="group flex items-center gap-2">
                <motion.input
                  readOnly
                  value={joinUrl}
                  className={cn(
                    "bg-muted w-full rounded-md border px-3 py-2 text-sm transition-colors",
                    recentCopy === "link" && "bg-green-50",
                  )}
                  whileTap={{ scale: 0.98 }}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springConfig}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(joinUrl, "link")}
                    className="relative flex size-9 items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      {recentCopy === "link" ? (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute"
                        >
                          <Check className="size-4 text-green-500" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Copy className="size-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springConfig, delay: 0.2 }}
            >
              <label className="text-sm font-medium">Invite Code</label>
              <div className="group flex items-center gap-2">
                <motion.input
                  readOnly
                  value={board.inviteCode}
                  className={cn(
                    "bg-muted w-full rounded-md border px-3 py-2 font-mono text-sm transition-colors",
                    recentCopy === "code" && "bg-green-50",
                  )}
                  whileTap={{ scale: 0.995 }}
                />
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={springConfig}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(board.inviteCode, "code")}
                    className="relative flex size-9 items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      {recentCopy === "code" ? (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute"
                        >
                          <Check className="size-4 text-green-500" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Copy className="size-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareBoardModal;
