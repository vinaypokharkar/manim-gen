"use client";

import React, { useState, useEffect } from 'react';
import { Play, Menu, X, ArrowRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  onLoginSuccess?: () => void;
}

export const Navbar = ({ onLoginSuccess }: NavbarProps) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null); // 'login', 'signup', or null (closed)

  const openLogin = () => setAuthMode('login');
  const openSignup = () => setAuthMode('signup');
  const closeModal = () => setAuthMode(null);

  // Get username from user metadata, fallback to email
  const getDisplayName = () => {
    if (!user) return '';
    const metadata = user.user_metadata || {};
    return metadata.full_name || 
           metadata.name || 
           metadata.username || 
           metadata.preferred_username || 
           user.email?.split('@')[0] || 
           user.email || 
           'User';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onLoginSuccess?.(); // Update parent state if needed
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user && authMode !== null) {
      closeModal();
      onLoginSuccess?.();
    }
  }, [user, authMode, onLoginSuccess]);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-[#525252] bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#CA3E47] rounded-lg flex items-center justify-center shadow-lg shadow-[#CA3E47]/20">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Animind</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
                <Link href="#how-it-works" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</Link>
                <Link href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
              </div>
            </div>

            {/* CTA Buttons - Now Interactive */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                      <p className="text-xs text-gray-400">Signed in</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium px-3 py-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={openLogin}
                    className="text-gray-300 hover:text-white text-sm font-medium px-3 py-2 transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={openSignup}
                    className="bg-[#CA3E47] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#a8323a] transition-colors flex items-center gap-2 shadow-lg shadow-[#CA3E47]/20"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white p-2">
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-[#1a1a1a] border-b border-[#525252]">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Features</Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">How it Works</Link>
              {user ? (
                <>
                  <div className="px-3 py-2 border-b border-[#525252] mb-2">
                    <p className="text-sm font-medium text-white">{getDisplayName()}</p>
                    <p className="text-xs text-gray-400">Signed in</p>
                  </div>
                  <button 
                    onClick={() => { setIsOpen(false); handleSignOut(); }}
                    className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsOpen(false); openLogin(); }}
                    className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setIsOpen(false); openSignup(); }}
                    className="w-full mt-4 bg-[#CA3E47] text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Floating Modal Component */}
      <AuthModal 
        isOpen={authMode !== null}
        onClose={closeModal}
        mode={authMode || 'login'} // Default to login if null, but isOpen handles visibility
        onSwitchMode={(newMode) => setAuthMode(newMode)}
        onLoginSuccess={() => {
          closeModal();
          onLoginSuccess?.();
        }}
      />
    </>
  );
};