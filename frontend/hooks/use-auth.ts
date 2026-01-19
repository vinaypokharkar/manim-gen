import { useState, useEffect } from "react";

export interface UserInfo {
  id: string;
  email: string;
  metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and user_info in localStorage
    const token = localStorage.getItem("access_token");
    const userInfoStr = localStorage.getItem("user_info");

    if (token && userInfoStr) {
      try {
        const parsedUser = JSON.parse(userInfoStr);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user info", e);
        localStorage.removeItem("user_info");
        localStorage.removeItem("access_token");
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
