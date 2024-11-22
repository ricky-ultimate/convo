import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface Message {
  id?: number;
  content: string;
  user: { username: string };
  timestamp: string;
  messageType: "text" | "image";
}

export const useSocket = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter(); // Add router for navigation

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No JWT token found. Please log in.");
      router.push("/auth/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // Initialize socket connection with JWT token in headers
    const socketInstance = io(apiUrl, {
      path: "/ws",
      extraHeaders: {
        Authorization: `Bearer ${token}`, // Pass the token for authentication
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

    // Listen for incoming messages and update the state
    socketInstance.on("message", (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
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
