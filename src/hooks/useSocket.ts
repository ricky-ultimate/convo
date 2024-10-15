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
      router.push("/login");
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

    socketInstance.on("error", (errorData) => {
      const { message, code } = errorData;
      console.error(`Error (${code}): ${message}`);

      // Handle specific error codes
      if (code === "UNAUTHORIZED") {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        // Display message to users in case of other errors
        alert(message);
      }
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
