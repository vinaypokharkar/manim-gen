"use client";

import Navbar from "@/components/landing/Navbar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { RecentProjects } from "@/components/landing/RecentProjects";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateChat = async () => {
    if (!prompt.trim()) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/api/chats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ initial_prompt: prompt }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("Create chat failed:", res.status, errText);
        throw new Error(`Failed to create chat: ${res.status} ${errText}`);
      }

      const chat = await res.json();
      router.push(`/project/${chat.id}`);
    } catch (error) {
      console.error(error);
      // Handle error (toast or alert)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 pt-16">
        <div className="flex w-full max-w-3xl flex-col items-center gap-8">
          {/* Subtle branding */}
          <div className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground/80">
            <Image
              src="/CodeMotion-logo.png"
              alt="CodeMotion Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            CodeMotion
          </div>

          <div className="relative w-full">
            <div className="relative flex flex-col rounded-xl border border-border/50 bg-background shadow-xl ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <Textarea
                placeholder="Describe the mathematical animation you want to create..."
                className="min-h-[50px] w-full resize-none border-none bg-transparent p-6 text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting || authLoading}
              />
              <div className="flex items-center justify-between p-4">
                <div className="flex gap-2">
                  {/* Placeholder for future tools/attachments if needed */}
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all hover:scale-105"
                  onClick={handleCreateChat}
                  disabled={!prompt.trim() || isSubmitting || authLoading}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ArrowUp className="h-5 w-5" />
                      <span className="sr-only">Send</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <RecentProjects />
      </main>
    </div>
  );
}
