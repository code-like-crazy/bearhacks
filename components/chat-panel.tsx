"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AIChat } from "./chat/ai-chat";
import { TeamChat } from "./chat/team-chat";

interface ChatPanelProps {
  geminiResponse: string | null;
}

export default function ChatPanel({ geminiResponse }: ChatPanelProps) {
  return (
    <div className="z-30 flex w-72 flex-col border-l border-l-gray-200 bg-gray-50">
      <div className="border-b p-3">
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
    </div>
  );
}
