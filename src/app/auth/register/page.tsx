"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AtSignIcon, Lock, UserCircle } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // POST request to the NestJS backend for registration
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      // Store the JWT token in localStorage
      localStorage.setItem("token", data.access_token);
      // Redirect to the login page after registration
      router.push("/login");
    } else {
      // Handle error
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <AtSignIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-500"
            strokeWidth={1.25}
          />
          <Input
            name="convo-email"
            type="email"
            required={true}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "pl-10 py-2 border border-gray-300 focus-visible:border-violet-500 rounded-md focus:ring-2 focus-visible:ring-2 focus:ring-violet-100 focus:!outline-none focus-visible:ring-violet-100"
            )}
          />
        </div>
        <div className="relative">
          <UserCircle
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-500"
            strokeWidth={1.25}
          />
          <Input
            name="kaizen-username"
            type="text"
            required={true}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={cn(
              "pl-10 py-2 border border-gray-300 focus-visible:border-violet-500 rounded-md focus:ring-2 focus-visible:ring-2 focus:ring-violet-100 focus:!outline-none focus-visible:ring-violet-100"
            )}
          />
        </div>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-500"
            strokeWidth={1.25}
          />
          <Input
            name="convo-password"
            type="password"
            required={true}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "pl-10 py-2 border border-gray-300 focus-visible:border-violet-500 rounded-md focus:ring-2 focus-visible:ring-2 focus:ring-violet-100 focus:!outline-none focus-visible:ring-violet-100"
            )}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button
          name="convo-button"
          type="submit"
          className="bg-violet-500 font-bold text-xl mt-2 w-full hover:bg-violet-600"
        >
          Login
        </Button>
      </form>
    </div>
  );
}
