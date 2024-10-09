"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // POST request to the NestJS backend for login
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // Axios automatically parses the response data
      const data = res.data;

      if (data.access_token) {
        // Store the JWT token in localStorage
        localStorage.setItem("token", data.access_token);
        // Redirect to the dashboard after login
        router.push("/dashboard");
      } else {
        // Handle error
        setError(data.error || "Login failed");
      }
    } catch (err: any) {
      // Handle any error that occurs during the request
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 text-black"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2">
          Login
        </button>
      </form>
    </div>
  );
}
