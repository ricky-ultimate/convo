"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface ChatRoom {
  id: string;
  name: string;
  createdAt: string;
  messageCount: number;
  memberCount: number;
}

export default function ChatsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    async function fetchRooms() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await fetch(`${apiUrl}/chat/rooms`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/auth/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch rooms");
        }

        const data = await res.json();
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRooms();
  }, [router]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/chat/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create room");
      }

      const data = await res.json();
      setRooms((prev) => [data, ...prev]);
      setRoomName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading rooms...</div>;
  }

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chat Rooms</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
        />
        <Button onClick={handleCreateRoom}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="grid gap-4">
        {rooms.map((room) => (
          <Link key={room.id} href={`/chats/${room.id}`}>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{room.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {new Date(room.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{room.memberCount} members</span>
                <span>{room.messageCount} messages</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
