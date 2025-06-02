"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-32 bg-foreground/20 rounded animate-pulse" />
          <div className="h-10 w-20 bg-border rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          <div className="p-6 border rounded-lg">
            <div className="h-6 w-32 bg-foreground/20 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-4">
        <Link href="/chats">
          <div className="p-6 border rounded-lg hover:bg-accent/50 transition-colors">
            <h2 className="text-xl font-semibold">Chat Rooms</h2>
            <p className="text-muted-foreground">Join or create chat rooms</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
