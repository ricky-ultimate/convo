import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  user: { username: string };
  createdAt: string;
}

export const useSocket = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const socketInstance = io(apiUrl, {
      path: "/ws",
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    setSocket(socketInstance);

    socketInstance.emit("joinRoom", { roomId });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    });

    socketInstance.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("userJoined", (data: { username: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `${data.username} joined the room`,
          user: { username: "System" },
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    socketInstance.on("userLeft", (data: { username: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `${data.username} left the room`,
          user: { username: "System" },
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId, router]);

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit("message", { roomId, content });
    }
  };

  return { messages, sendMessage };
};
