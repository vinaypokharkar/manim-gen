"use client";

import { MessageSquare, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function ChatLandingPage() {
  const router = useRouter();

  const startNewChat = async () => {
    try {
      const res = await apiClient.post("/chats", { title: "New Conversation" });
      router.push(`/chat/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-950 text-white">
      <div className="bg-gray-800 p-6 rounded-full mb-6">
        <MessageSquare size={48} className="text-blue-500" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Welcome to Manim Gen</h1>
      <p className="text-gray-400 max-w-md mb-8">
        Start a new conversation to generate mathematical animations using
        Python code.
      </p>
      <button
        onClick={startNewChat}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-transform hover:scale-105"
      >
        Start Creating <ArrowRight size={20} />
      </button>
    </div>
  );
}
