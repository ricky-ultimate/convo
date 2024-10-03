import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // Connect to the WebSocket server
    const socketInstance = io("/api/socket", {
      path: "/api/socket",
    });

    setSocket(socketInstance);

    // Join the specified room
    socketInstance.emit("joinRoom", roomId);

    // Listen for incoming messages
    socketInstance.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup when component unmounts
    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  // Function to send a message
  const sendMessage = (message: string) => {
    if (socket) {
      socket.emit("message", { roomId, message });
    }
  };

  return { messages, sendMessage };
};
