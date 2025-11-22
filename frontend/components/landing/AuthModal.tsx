"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
  onLoginSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onLoginSuccess }: AuthModalProps) => {
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isLogin = mode === 'login';

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // The redirect will happen automatically, so we don't need to call onLoginSuccess here
      // It will be called when the user returns from OAuth
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };


  

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#1e1e1e] border border-[#525252] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto relative"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-[#CA3E47]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 bg-[#CA3E47] rounded-lg shadow-lg shadow-[#CA3E47]/30" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {isLogin 
                      ? 'Enter your details to access your workspace.' 
                      : 'Start creating mathematical videos in seconds.'}
                  </p>
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || authLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading || authLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        {/* Google SVG Logo */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>

                  <button className="w-full flex items-center justify-center gap-3 bg-[#313131] border border-[#525252] text-white hover:bg-[#414141] hover:border-gray-500 font-medium py-2.5 rounded-lg transition-all">
                    <Mail className="w-5 h-5 text-gray-400" />
                    Continue with Email
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#525252]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#1e1e1e] px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Manual Input (Visual Only) */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      className="w-full bg-[#151515] border border-[#525252] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#CA3E47] transition-colors placeholder-gray-600"
                    />
                  </div>
                  <button className="w-full bg-[#CA3E47] hover:bg-[#b8323b] text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#CA3E47]/20">
                    {isLogin ? 'Sign In' : 'Get Started'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Footer Toggle */}
                <div className="mt-6 text-center text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => onSwitchMode(isLogin ? 'signup' : 'login')}
                    className="text-[#CA3E47] hover:underline font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};