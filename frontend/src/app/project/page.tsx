"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Send, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Code2,
  Sparkles,
  MoreVertical,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// --- Types ---
type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const { getAccessToken } = useAuth();
  
  // Get initial data from URL params and decode
  const videoUrlParam = searchParams.get('videoUrl');
  const decodedVideoUrl = videoUrlParam ? decodeURIComponent(videoUrlParam) : null;
  const initialPrompt = searchParams.get('prompt');
  const initialCode = searchParams.get('code');

  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // Load saved width from localStorage, default to 380px
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarWidth');
      return saved ? parseInt(saved, 10) : 380;
    }
    return 380;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [input, setInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(decodedVideoUrl);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update video URL when URL param changes
  useEffect(() => {
    if (decodedVideoUrl) {
      console.log('Setting video URL:', decodedVideoUrl);
      setCurrentVideoUrl(decodedVideoUrl);
      setVideoError(null);
    }
  }, [decodedVideoUrl]);

  // Debug: Log video URL state
  useEffect(() => {
    console.log('Current video URL:', currentVideoUrl);
  }, [currentVideoUrl]);
  
  // Initialize messages from URL params or default
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialPrompt && decodedVideoUrl) {
      return [
        {
          id: '1',
          role: 'user',
          content: initialPrompt,
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'ai',
          content: 'I\'ve generated your animation! The video is ready to preview.',
          timestamp: new Date()
        }
      ];
    }
    return [
      {
        id: '1',
        role: 'ai',
        content: 'Hello! I am ready to generate Manim animations. What shall we build today?',
        timestamp: new Date()
      }
    ];
  });

  // Save sidebar width to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    }
  }, [sidebarWidth]);

  // Handle resize
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const minWidth = 280;
      const maxWidth = Math.min(800, window.innerWidth * 0.6);
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Auto-scroll chat to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Video controls
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setVideoProgress(video.currentTime);
      setVideoDuration(video.duration || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
      setVideoDuration(video.duration || 0);
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [currentVideoUrl]);

  // Handlers
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const userInput = input;
    setInput('');
    
    // Call API to generate new video
    try {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Generating code for your request... This may take up to a minute.',
        timestamp: new Date()
      }]);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is logged in
      const accessToken = getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('http://localhost:8008/api/generate-and-render', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: userInput.trim(),
          scene_class: 'GeneratedScene',
          quality: 'low',
          filename: 'script.py',
          max_retries: 2
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.supabase_url) {
        setCurrentVideoUrl(data.supabase_url);
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === 'ai') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: 'I\'ve generated your animation! The video is ready to preview.'
            };
          }
          return updated;
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. The generation is taking longer than expected. Please try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Could not connect to the server. Please check if the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.role === 'ai') {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: `Error: ${errorMessage}`
          };
        }
        return updated;
      });
    }
    };

  return (
    <div className="flex h-screen w-full bg-[#1a1a1a] text-white overflow-hidden">
      
      {/* ---------------------------------------------------------------------------
          LEFT SIDEBAR (Chat & Controls)
      --------------------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            ref={sidebarRef}
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: sidebarWidth, 
              opacity: 1
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={isResizing ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col border-r border-[#525252] bg-[#1e1e1e] h-full relative z-20"
          >
            {/* 1. Sidebar Header: Title + Hide Button */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#525252] flex-shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <Link href="/" className="p-1 hover:bg-[#313131] rounded-md transition-colors text-gray-400 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="font-bold text-sm truncate text-white">Binary Tree Viz</h1>
                  <p className="text-xs text-gray-500">Last edited just now</p>
                </div>
              </div>
              
              {/* HIDE SIDEBAR BUTTON */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#313131] rounded-lg transition-colors"
                title="Close Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={startResize}
              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:w-1.5 transition-all z-30 ${
                isResizing ? 'bg-[#CA3E47] w-1.5' : 'bg-transparent hover:bg-[#CA3E47]/50'
              }`}
              title="Drag to resize"
            />

            {/* 2. Chat Area (Middle) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'ai' 
                      ? 'bg-[#CA3E47] shadow-lg shadow-[#CA3E47]/20' 
                      : 'bg-[#313131] border border-[#525252]'
                  }`}>
                    {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : 'U'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#313131] text-white border border-[#525252]'
                      : 'bg-transparent text-gray-300'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Area (Bottom) */}
            <div className="p-4 border-t border-[#525252] bg-[#1e1e1e] flex-shrink-0">
              <form 
                onSubmit={handleSendMessage}
                className="relative bg-[#151515] border border-[#525252] focus-within:border-[#CA3E47] rounded-xl overflow-hidden transition-colors shadow-inner"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe changes..."
                  className="w-full bg-transparent text-sm text-white placeholder-gray-500 p-3 max-h-32 resize-none focus:outline-none custom-scrollbar"
                  rows={1}
                  style={{ minHeight: '50px' }}
                />
                <div className="flex justify-between items-center px-2 pb-2 bg-[#151515]">
                  <div className="flex gap-1">
                     {/* Optional attachment buttons could go here */}
                  </div>
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 rounded-lg bg-[#CA3E47] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a8323a] transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------------------
          RIGHT MAIN CONTENT (Video Preview)
      --------------------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col relative h-full bg-[#0a0a0a]">
        
        {/* Header Overlay (When sidebar is closed) */}
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-50">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-[#1e1e1e] border border-[#525252] text-white rounded-lg shadow-xl hover:border-[#CA3E47] transition-colors"
              title="Open Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Toolbar / Top Bar for Video */}
        <div className="h-16 border-b border-[#525252] bg-[#1a1a1a] flex items-center justify-end px-6 gap-4">
           {/* View Toggle Chips */}
           <div className="bg-[#313131] p-1 rounded-lg flex text-xs font-medium mr-auto ml-12 md:ml-0">
              <button className="px-3 py-1 bg-[#525252] text-white rounded-md shadow-sm">Preview</button>
              <button className="px-3 py-1 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <Code2 className="w-3 h-3" /> Code
              </button>
           </div>

           <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
             <Download className="w-4 h-4" /> Export
           </button>
           <button className="bg-[#CA3E47] hover:bg-[#a8323a] text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-lg shadow-[#CA3E47]/20">
             Share
           </button>
        </div>

        {/* Video Canvas Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative">
           
           {/* Background Pattern for "Empty/Canvas" feel */}
           <div className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: 'radial-gradient(#525252 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
           </div>

           {/* The Video Player Wrapper */}
           <motion.div 
             layout
             className="relative w-full max-w-4xl aspect-video bg-black rounded-xl border border-[#525252] shadow-2xl overflow-hidden group"
           >
              {currentVideoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={currentVideoUrl}
                    className="w-full h-full object-contain"
                    controls={false}
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('Video error:', e);
                      const video = e.currentTarget;
                      console.error('Video error code:', video.error?.code);
                      console.error('Video error message:', video.error?.message);
                      
                      // Check if it's a network/404 error (bucket not found)
                      if (video.error?.code === 4 || video.networkState === 3) {
                        setVideoError('Bucket not found - The Supabase storage bucket does not exist or is not accessible. Please create the bucket in your Supabase dashboard.');
                      } else {
                        setVideoError(`Failed to load video: ${video.error?.message || 'Unknown error'}`);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setVideoDuration(videoRef.current.duration);
                        setVideoError(null);
                        console.log('Video loaded successfully, duration:', videoRef.current.duration);
                      }
                    }}
                    onCanPlay={() => {
                      console.log('Video can play');
                    }}
                    onTimeUpdate={() => {
                      // Update scrubber position if needed
                    }}
                  />
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white p-6">
                      <div className="text-center max-w-md">
                        <p className="text-red-400 mb-3 font-semibold">{videoError}</p>
                        {videoError.includes('Bucket not found') && (
                          <div className="text-left text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg mt-3">
                            <p className="font-semibold mb-2">To fix this:</p>
                            <ol className="list-decimal list-inside space-y-1 text-xs">
                              <li>Go to your Supabase Dashboard</li>
                              <li>Navigate to Storage</li>
                              <li>Create a bucket named "videos" (or update SUPABASE_BUCKET env var)</li>
                              <li>Make the bucket public or configure proper permissions</li>
                            </ol>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-4 break-all">URL: {currentVideoUrl}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-6 gap-4">
                     <button 
                       onClick={() => setIsPlaying(!isPlaying)}
                       className="text-white hover:text-[#CA3E47] transition-colors z-10"
                     >
                       {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                     </button>
                     
                     {/* Scrubber */}
                     <div 
                       className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all"
                       onClick={(e) => {
                         if (videoRef.current && videoDuration > 0) {
                           const rect = e.currentTarget.getBoundingClientRect();
                           const percent = (e.clientX - rect.left) / rect.width;
                           videoRef.current.currentTime = percent * videoDuration;
                         }
                       }}
                     >
                        <div 
                          className="h-full bg-[#CA3E47] rounded-full transition-all"
                          style={{
                            width: videoDuration > 0 
                              ? `${(videoProgress / videoDuration) * 100}%`
                              : '0%'
                          }}
                        />
                     </div>

                     <span className="text-xs font-mono text-gray-400">
                       {videoDuration > 0
                         ? `${Math.floor(videoProgress)}s / ${Math.floor(videoDuration)}s`
                         : '0s / 0s'
                       }
                     </span>

                     <button 
                       onClick={() => {
                         if (videoRef.current) {
                           videoRef.current.currentTime = 0;
                           setIsPlaying(false);
                         }
                       }}
                       className="text-gray-400 hover:text-white transition-colors"
                     >
                        <RotateCcw className="w-4 h-4" />
                     </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                   <div className="relative w-64 h-64 border-4 border-[#CA3E47] rounded-lg flex items-center justify-center">
                      <div className="text-[#CA3E47] font-mono text-xs absolute -bottom-8">No video yet</div>
                      <motion.div 
                        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 border-t-4 border-white rounded-full"
                      />
                   </div>
                </div>
              )}
           </motion.div>
        </div>
      </main>

    </div>
  );
}