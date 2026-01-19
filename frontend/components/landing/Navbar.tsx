"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, loading, logout } = useAuth();

  // Helper to get initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Animind
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </div>

        {/* Auth Buttons or User Profile */}
        <div className="flex items-center gap-4">
          {loading ? (
            // Simple loading placeholder
            <div className="h-9 w-20 bg-muted animate-pulse rounded overflow-hidden" />
          ) : user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-auto rounded-full bg-muted/60 pl-2 pr-1 hover:bg-muted font-normal focus:ring-2 focus:ring-primary focus:ring-offset-1 flex items-center gap-2"
                >
                  
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarImage
                      src={user.metadata?.avatar_url}
                      alt={user.metadata?.full_name}
                    />
                    <AvatarFallback className="font-medium text-xs">
                      {getInitials(user.metadata?.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-1">
                  <p className="font-semibold leading-none">
                    {user.metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none">
                    {user.email}
                  </p>
                </div>
                <div className="my-2 h-px bg-muted" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
