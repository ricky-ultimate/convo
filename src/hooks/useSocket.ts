import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No JWT token found. Please log in.");
      return;
    }

    // Initialize socket connection with JWT token in headers
    const socketInstance = io("http://localhost:3000", {
      path: "/ws",
      extraHeaders: {
        Authorization: `Bearer ${token}`, // Pass the token for authentication
      },
    });

    setSocket(socketInstance);

    // Emit the joinRoom event without handling username on client-side
    socketInstance.emit("joinRoom", { roomId });

    // Listen for incoming messages
    socketInstance.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit("message", { roomId, content });
    }
  };

  return { messages, sendMessage };
};
