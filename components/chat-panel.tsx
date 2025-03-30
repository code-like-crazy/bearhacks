"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react"; // Import useRef
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Removed duplicate useEffect import

interface ChatMessage {
  text: string;
  sender: string;
}

interface ChatPanelProps {
  geminiResponse: string | null;
}

export default function ChatPanel({ geminiResponse }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for the end of messages

  // Add Gemini's response to the chat when it changes
  useEffect(() => {
    if (geminiResponse) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: geminiResponse, sender: "gemini" },
      ]);
    }
  }, [geminiResponse]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addGeminiMessage = (text: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: text, sender: "gemini" },
    ]);
  };

  // Function to add a new message to the chat
  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, sender: "user" },
      ]);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="z-30 flex w-72 flex-col border-l border-l-gray-200 bg-gray-50">
      <div className="border-b p-3">
        <h3 className="font-medium">Chat</h3>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div className="text-muted-foreground text-sm">
              No messages yet. Start a conversation about your travel plans.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Empty div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
