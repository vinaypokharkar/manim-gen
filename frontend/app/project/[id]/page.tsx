"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  Play,
  SkipBack,
  SkipForward,
  Loader2,
  Code,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  video_url?: string;
  sanitized_code?: string;
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Chat Data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchChat = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/api/chats/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to load project");

        const data: Chat = await res.json();
        setChat(data);
        setMessages(data.messages);

        // Find latest video to play
        const latestVideoMsg = [...data.messages]
          .reverse()
          .find((m) => m.video_url);
        if (latestVideoMsg?.video_url) {
          setCurrentVideoUrl(latestVideoMsg.video_url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [projectId, user, authLoading, router]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;

    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setSending(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/api/chats/${projectId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: newMsg.content }),
        },
      );

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json(); // Returns the *assistant* message usually, or updated chat list?

      // The endpoint returns MessageOut (Assistant's response) usually
      // Let's verify what `send_message` returns in backend.
      // It returns MessageOut.

      const assistantMsg: Message = data;
      setMessages((prev) => [...prev, assistantMsg]);

      if (assistantMsg.video_url) {
        setCurrentVideoUrl(assistantMsg.video_url);
      }
    } catch (err) {
      console.error(err);
      // Ideally show error state in chat
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">
          Project not found or access denied.
        </p>
        <Button onClick={() => router.push("/")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>{chat.title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          Back to Dashboard
        </Button>
      </header>

      {/* Main Content Area - Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Chat Interface */}
        <div className="flex w-[400px] flex-col border-r bg-background/50 backdrop-blur-sm">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-10">
                Start the conversation...
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex flex-col gap-2 ${msg.role === "assistant" ? "items-start" : "items-end"}`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-muted rounded-tl-none text-foreground"
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.sanitized_code && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 ml-1 cursor-pointer hover:text-foreground">
                    <Code className="h-3 w-3" /> Code generated
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex flex-col gap-2 items-start">
                <div className="bg-muted px-4 py-2 rounded-lg rounded-tl-none text-sm flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Generating
                  animation...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t bg-background">
            <div className="relative">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[80px] w-full resize-none pr-12 shadow-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                onClick={handleSendMessage}
                disabled={!input.trim() || sending}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Video / Workspace */}
        <div className="flex flex-1 flex-col overflow-hidden bg-muted/10">
          <div className="flex h-full flex-col p-4 w-full">
            <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed bg-background/50 relative overflow-hidden">
              {currentVideoUrl ? (
                <video
                  src={currentVideoUrl}
                  controls
                  className="w-full h-full object-contain max-h-[80vh]"
                  autoPlay
                  loop
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                  <p>Processed video will appear here</p>
                </div>
              )}
            </div>

            {/* Dummy Timeline / Controls (Visual only - can be removed or made real users) */}
            {currentVideoUrl && (
              <div className="mt-4 flex items-center justify-between rounded-lg border bg-card p-2 px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Video Output
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
