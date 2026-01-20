"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, MoreHorizontal, Layout, Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatProject {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function RecentProjects() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ChatProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/api/chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          // Take only the top 3 most recent
          setProjects(data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, authLoading]);

  const formatDate = (dateString: string) => {
    // Return "Viewed X ago" format if possible, or just date
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Viewed just now";
    if (diffInSeconds < 3600)
      return `Viewed ${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `Viewed ${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `Viewed ${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  // If not logged in or no projects, don't show the section (or show empty state if desired)
  // Logic: Show only if user is logged in. If empty, maybe show empty state or nothing.
  if (!user || authLoading) return null;

  if (!loading && projects.length === 0) return null;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 mt-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-2xl bg-[#0F0F10] border border-white/5 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-white bg-white/10 px-3 py-1.5 rounded-md transition-colors">
              Recently viewed
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Shared with me
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Templates
            </button>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[300px] bg-gradient-to-b from-[#0F0F10] to-black/50">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group relative block"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/10 border border-white/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:border-white/10">
                    {/* Fake Thumbnail UI */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 p-3">
                      <div className="h-full w-full rounded border border-white/5 bg-black/20 p-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
                          <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
                          <div className="h-2 w-2 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-1/3 bg-white/10 rounded"></div>
                          <div className="h-20 w-full bg-white/5 rounded border border-dashed border-white/5 flex items-center justify-center">
                            <Play className="h-6 w-6 text-white/20" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                        Open Project
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate max-w-[200px]">
                        {project.title === "New Chat"
                          ? "Untitled Animation"
                          : project.title}
                      </h3>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        {formatDate(project.updated_at || project.created_at)}
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs font-semibold">
                      {project.title.substring(0, 1).toUpperCase()}
                    </div>
                  </div>
                </Link>
              ))}

              {/* Add empty slots to fill grid if needed, or just show list */}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
