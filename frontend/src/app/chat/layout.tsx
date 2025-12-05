"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return null;

  return (
    <div className="flex h-screen bg-black">
      <ChatSidebar />
      <main className="flex-1 h-full relative">{children}</main>
    </div>
  );
}
