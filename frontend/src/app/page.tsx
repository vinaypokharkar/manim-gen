import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black z-0 pointer-events-none" />

      <main className="z-10 max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
          <span className="text-blue-400 font-mono text-sm">
            v1.0.0 Public Beta
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Turn Text into <br />
          <span className="text-blue-500">Math Animations</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Powered by Manim and AI. Describe a mathematical concept, geometric
          scene, or algorithm, and watch it come to life in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/chat"
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105"
          >
            Get Started
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="https://github.com/3b1b/manim"
            target="_blank"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 px-8 py-4 rounded-full text-lg font-medium transition-colors"
          >
            Learn about Manim
          </Link>
        </div>
      </main>

      <footer className="z-10 absolute bottom-8 text-gray-600 text-sm">
        Built with FastAPI, Next.js, and Supabase
      </footer>
    </div>
  );
}
