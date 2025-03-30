"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Send, User2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";

import { useMutation, useStorage } from "@/lib/liveblocks.config";
import type { ChatMessage } from "@/lib/liveblocks.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamChat() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = useStorage((root) => root.chatMessages);

  const addMessage = useMutation(
    ({ storage }, text) => {
      if (!session?.user) return;

      const newMessage: ChatMessage = {
        id: nanoid(),
        text,
        sender: {
          id: session.user.id,
          name: session.user.name,
          imageUrl: session.user.imageUrl,
        },
        createdAt: Date.now(),
      };

      storage.get("chatMessages").push(newMessage);
    },
    [session],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim() && session?.user) {
      addMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isCurrentUser = (senderId: string) => {
    return session?.user.id === senderId;
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col">
      <div className="flex-1 overflow-auto px-4">
        {!chatMessages || chatMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full items-center justify-center p-4 text-center"
          >
            <div className="text-muted-foreground text-sm">
              No messages yet. Start a conversation about your whiteboard.
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 py-4">
            <AnimatePresence mode="popLayout">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex items-end gap-2 ${isCurrentUser(msg.sender.id) ? "justify-end" : "justify-start"}`}
                >
                  {!isCurrentUser(msg.sender.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-white"
                    >
                      {msg.sender.imageUrl ? (
                        <Image
                          src={msg.sender.imageUrl}
                          alt={msg.sender.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                          <User2 className="text-primary h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                      isCurrentUser(msg.sender.id)
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "rounded-bl-sm bg-gray-100 text-gray-800"
                    }`}
                  >
                    {!isCurrentUser(msg.sender.id) && (
                      <div className="absolute -top-5 left-0 text-xs font-medium text-gray-500">
                        {msg.sender.name}
                      </div>
                    )}
                    <span className="block text-sm">{msg.text}</span>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="border-t bg-white/80 p-4"
      >
        <div className="flex gap-2">
          <motion.div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="ring-primary/20 border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim() || !session}
              className="bg-primary hover:bg-primary/90 shadow-sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
