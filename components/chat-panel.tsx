"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

import { AIChat } from "./chat/ai-chat";
import { TeamChat } from "./chat/team-chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ChatPanelProps {
  geminiResponse: string | null;
}

export default function ChatPanel({ geminiResponse }: ChatPanelProps) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="z-30 flex w-72 flex-col border-l border-l-gray-200 bg-white/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center gap-2 border-b bg-white/80 p-4"
      >
        <MessageCircle className="text-primary h-5 w-5" />
        <h3 className="text-primary font-semibold">Chat</h3>
      </motion.div>

      <div className="p-3">
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">Team Chat</TabsTrigger>
            <TabsTrigger value="ai">AI Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="team" className="mt-0">
            <TeamChat />
          </TabsContent>
          <TabsContent value="ai" className="mt-0">
            <AIChat geminiResponse={geminiResponse} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
