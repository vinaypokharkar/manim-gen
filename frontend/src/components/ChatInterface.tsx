"use client";

import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { ChatWithMessages, Message } from "@/types";
import { Send, Loader2, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatInterfaceProps {
  chatId: string;
  initialData?: ChatWithMessages;
}

export function ChatInterface({ chatId, initialData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialData?.messages || []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    // Optimistically add user message
    const tempMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await apiClient.post(`/chats/${chatId}/message`, {
        prompt: userMsg,
      });
      const { message, video_url } = res.data;

      // Add assistant message
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      console.error("Failed to send message", err);
      // Remove optimistic message or show error?
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200 border border-gray-700"
              }`}
            >
              <div className="prose prose-invert prose-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Check if content likely has video (hacky check for now, better to depend on structured response) */}
              {msg.role === "assistant" &&
                msg.content.includes("generated video") && (
                  <div className="mt-4 bg-black rounded-lg overflow-hidden border border-gray-700">
                    <div className="p-4 flex items-center gap-2 text-gray-400">
                      <Play size={16} />
                      <span className="text-xs">
                        Video attached (Refresh to see if checking fails)
                      </span>
                    </div>
                    {/* 
                       In a real app, we'd get the VIDEO URL explicitly attached to the message object 
                       or parsing it from the response. 
                       For now, let's assume the user reloads or we passed it in state if we want instant playback.
                    */}
                  </div>
                )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl p-4 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-400" size={20} />
              <span className="text-gray-400 text-sm">Generating scene...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Describe a geometric scene..."
            className="flex-1 bg-gray-800 border-gray-700 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
