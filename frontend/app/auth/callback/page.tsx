"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  // Use a ref to prevent double-execution in React strict mode
  const processingRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authentication code found.");
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;

    const exchangeCode = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/api/auth/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Authentication failed");
        }

        // Store Session
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data.user));

        // Redirect Home
        router.push("/");
      } catch (err: any) {
        console.error("Auth Callback Error:", err);
        setError(err.message || "Failed to log in with Google.");
        processingRef.current = false; // allow retry if needed
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h2 className="text-xl font-semibold text-destructive">
          Authentication Error
        </h2>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="text-primary hover:underline"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Authenticating with Google...</p>
    </div>
  );
}
