"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  useLayoutEffect(() => {
    console.log(user, isAuthenticated);

    if (!isAuthenticated) {
      router.replace("/auth?action=login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl">Welcome, {user?.username} 👋</h1>
    </div>
  );
}
