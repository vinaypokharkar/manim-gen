"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { apiClient } from "@/lib/api/client";
import { ChatWithMessages } from "@/types";
import { useParams } from "next/navigation"; // Correct hook for App Router params

// We need to unwrap params in Next.js 15+, but let's stick to standard client usage
// Actually in Next 15 params is a Promise, but let's see which version user has.
// Package.json said "next": "16.0.3" -- checking...
// Wait, 16? That's likely Canary/RC.
// In Next 15+, params is async.

export default function ChatPage() {
  const params = useParams();
  const chatId = params?.chatId as string;

  const [chatData, setChatData] = useState<ChatWithMessages | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    apiClient
      .get<ChatWithMessages>(`/chats/${chatId}`)
      .then((res) => {
        setChatData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [chatId]);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading chat...
      </div>
    );

  return <ChatInterface chatId={chatId} initialData={chatData} />;
}
