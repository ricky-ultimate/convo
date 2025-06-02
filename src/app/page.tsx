"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  if (!isClient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-4xl font-bold">Welcome to Convo</h1>
          <p className="text-lg text-muted-foreground">
            A simple and secure chat application
          </p>
          <div className="flex gap-4 justify-center">
            <div className="h-10 w-20 bg-primary/20 rounded animate-pulse" />
            <div className="h-10 w-20 bg-border rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold">Welcome to Convo</h1>
        <p className="text-lg text-muted-foreground">
          A simple and secure chat application
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
