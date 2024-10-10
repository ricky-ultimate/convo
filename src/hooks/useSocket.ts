import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

interface Message {
  id?: number;
  content: string;
  user: { username: string };
  timestamp: string; // Include timestamp metadata
  messageType: "text" | "image"; // Message type for scalability
}

// Define a structure for JWT payload (this should match what your JWT contains)
interface JwtPayload {
  username: string; // Assuming your JWT contains the 'username'
}

export const useSocket = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get JWT token from localStorage
    if (!token) {
      console.error("No JWT token found. Please log in.");
      return;
    }

    try {
      // Decode the JWT token to get the username
      const decoded = jwtDecode<JwtPayload>(token);
      setUsername(decoded.username);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
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

    console.log(`Emitting joinRoom event with roomId: ${roomId} and username: ${username}`);

    // Join the room only if username is set
    if (username) {
      socketInstance.emit("joinRoom", { roomId, username });
    }

    // Listen for incoming messages
    socketInstance.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId, username]);

  const sendMessage = (content: string) => {
    if (socket && username) {
      socket.emit("message", { roomId, content, user: { username } });
    }
  };

  return { messages, sendMessage };
};
