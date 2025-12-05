"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Chat } from "@/types";
import Link from "next/link";
import { PlusCircle, MessageSquare } from "lucide-react";

export function ChatSidebar() {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await apiClient.get<Chat[]>("/chats");
      setChats(res.data);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await apiClient.post<Chat>("/chats", {
        title: "New Conversation",
      });
      // In a real app, you'd redirect here, but for now just reload list
      setChats([res.data, ...chats]);
      window.location.href = `/chat/${res.data.id}`;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col p-4">
      <button
        onClick={createNewChat}
        className="flex items-center gap-2 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-4 transition-colors"
      >
        <PlusCircle size={20} />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="flex items-center gap-3 p-3 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <MessageSquare size={18} />
            <span className="truncate">{chat.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
