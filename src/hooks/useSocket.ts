import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id?: number;
  content: string;
  user: { username: string };
  timestamp: string; // Include timestamp metadata
  messageType: "text" | "image"; // Message type for scalability
}

export const useSocket = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get JWT token from localStorage
    if (!token) {
      console.error("No JWT token found. Please log in.");
      return;
    }

    // Initialize socket connection with JWT token
    const socketInstance = io("http://localhost:3000", {
      path: "/ws",
      extraHeaders: {
        Authorization: `Bearer ${token}`, // Pass the token for authentication
      },
    });

    setSocket(socketInstance);

    // Join room
    socketInstance.emit("joinRoom", roomId, "Anonymous"); // Replace "Anonymous" with user details if needed

    // Listen for incoming messages and append them to the messages array
    socketInstance.on("message", (message) => {
      console.log("Received new message:", message);
      setMessages((prevMessages) => [...prevMessages, message]); // Append new messages
    });

    // Log socket errors
    socketInstance.on("error", (errorMsg) => {
      console.error("Socket error:", errorMsg);
    });

    // Clean up on unmount
    return () => {
      console.log("Disconnecting WebSocket");
      socketInstance.disconnect();
    };
  }, [roomId]);

  // Function to send messages
  const sendMessage = (
    content: string,
    messageType: "text" | "image" = "text"
  ) => {
    if (socket) {
      console.log(`Sending message: ${content} as ${messageType} to room ${roomId}`);
      socket.emit("message", {
        roomId,
        content,
        user: { username: "Anonymous" }, // You can update this to send actual user details
        messageType,
      });
    } else {
      console.error("Socket not initialized. Cannot send message.");
    }
  };

  return { messages, sendMessage };
};
