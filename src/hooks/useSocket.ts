import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react"; // Import useSession from NextAuth

export const useSocket = (roomId: string) => {
  const { data: session } = useSession(); // Get the logged-in user's session
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const socketInstance = io("http://localhost:4000", { path: "/ws" });

    setSocket(socketInstance);

    socketInstance.emit("joinRoom", roomId);

    socketInstance.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const sendMessage = (message: string) => {
    if (socket && session?.user) {
      socket.emit("message", {
        roomId,
        message,
        user: { username: session.user.username || "Anonymous" }, // Use username instead of name
      });
    }
  };

  return { messages, sendMessage };
};
