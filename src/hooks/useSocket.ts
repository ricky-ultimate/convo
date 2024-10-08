import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface Message {
  id?: number;
  content: string;
  user: { username: string };
  timestamp: string; // Include timestamp metadata
  messageType: "text" | "image"; // Message type for scalability
}

export const useSocket = (roomId: string) => {
  const { data: session } = useSession(); // Get the logged-in user's session
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socketInstance = io("http://localhost:4000", { path: "/ws" });

    setSocket(socketInstance);

    // Join room if the user is logged in and has a session
    if (session?.user) {
      socketInstance.emit("joinRoom", roomId, session.user.username);
    }

    // Listen for incoming messages with metadata
    socketInstance.on("message", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, timestamp: new Date().toISOString() },
      ]);
    });

    // Handle server-side errors (e.g., membership validation failures)
    socketInstance.on("error", (errorMsg) => {
      console.error("Socket error:", errorMsg);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId, session?.user]);

  const sendMessage = (
    content: string,
    messageType: "text" | "image" = "text"
  ) => {
    if (socket && session?.user) {
      socket.emit("message", {
        roomId,
        content,
        user: { username: session.user.username || "Anonymous" },
        messageType,
      });
    }
  };

  return { messages, sendMessage };
};
