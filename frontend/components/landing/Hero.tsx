"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sparkles, 
  ArrowUp, 
  Paperclip, 
  Globe, 
  Mic, 
  Plus,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface GenerateResponse {
  success: boolean;
  filename: string;
  local_path: string;
  supabase_url: string;
  code: string;
  sanitized_code: string;
  error?: string;
  logs?: Record<string, any>;
}

export const Hero = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { getAccessToken } = useAuth();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
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
          prompt: input.trim(),
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

      const data: GenerateResponse = await response.json();
      
      if (data.success && data.supabase_url) {
        // Navigate to project page with data
        router.push(`/project?videoUrl=${encodeURIComponent(data.supabase_url)}&prompt=${encodeURIComponent(input.trim())}&code=${encodeURIComponent(data.code || '')}`);
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
      
      alert(`Failed to generate video: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
      
      {/* --- Background Aurora Gradient (Lovable Style) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
       
        
        {/* Secondary blue/cyan glow to mimic the spectrum in the image */}
       
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center text-center">
        
        {/* --- Pill Badge --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#424242] hover:bg-[#525252] border border-[#525252] transition-all">
            <span className="px-2 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider">
              New
            </span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              Manim Engine 2.0 Live
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
        </motion.div>

        {/* --- Main Title --- */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4"
        >
          Build something <span className="text-[#CA3E47]">Mathematical</span>
        </motion.h1>

        {/* --- Subtitle --- */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-400 mb-12 max-w-2xl"
        >
          Create educational videos and data visualizations by chatting with AI.
        </motion.p>

        {/* --- The "Lovable" Input Box --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-3xl"
        >
          <form 
            onSubmit={handleSubmit}
            className="relative group bg-[#1e1e1e] rounded-2xl border border-[#525252] shadow-2xl shadow-black/50 transition-all focus-within:border-[#CA3E47]/50 focus-within:ring-1 focus-within:ring-[#CA3E47]/50"
          >
            
            {/* Text Area */}
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Animind to create a visualization of a binary search tree..."
              className="w-full h-20 bg-transparent text-lg text-white placeholder-gray-500 p-6 resize-none outline-none font-medium"
              spellCheck={false}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between px-4 pb-4">
              
              {/* Left Actions */}
              <div className="flex items-center gap-2">
                {/* Plus Button */}
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#313131] transition-colors border border-transparent hover:border-[#525252]">
                  <Plus className="w-5 h-5" />
                </button>
                
                {/* Attach Button */}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-[#313131] transition-colors border border-transparent hover:border-[#525252]">
                  <Paperclip className="w-4 h-4" />
                  <span>Attach</span>
                </button>

                {/* Theme/Globe Button */}
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-[#313131] transition-colors border border-transparent hover:border-[#525252]">
                  <Globe className="w-4 h-4" />
                  <span>Manim CE</span>
                </button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                
                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full bg-[#414141] text-gray-400 hover:bg-[#CA3E47] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Suggested Prompts (Optional, below input) */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
            <span className="opacity-50">Try asking:</span>
            <button 
              type="button"
              onClick={() => setInput('Create a rotating 3D cube')}
              className="hover:text-[#CA3E47] transition-colors"
              disabled={isLoading}
            >
              "Rotating 3D Cube"
            </button>
            <span className="opacity-30">•</span>
            <button 
              type="button"
              onClick={() => setInput('Visualize a Fourier Series')}
              className="hover:text-[#CA3E47] transition-colors"
              disabled={isLoading}
            >
              "Fourier Series"
            </button>
            <span className="opacity-30">•</span>
            <button 
              type="button"
              onClick={() => setInput('Show sorting algorithms animation')}
              className="hover:text-[#CA3E47] transition-colors"
              disabled={isLoading}
            >
              "Sorting Algorithms"
            </button>
          </div>

        </motion.div>
      </div>
    </section>
  );
};