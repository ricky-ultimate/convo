"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function ChatRoom() {
  const { chatRoomId } = useParams(); // Dynamic room ID from URL
  const roomId = Array.isArray(chatRoomId) ? chatRoomId[0] : chatRoomId;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { sendMessage, messages: socketMessages } = useSocket(roomId); // WebSocket messages

  // Fetch chat room message history from NestJS backend
  useEffect(() => {
    async function fetchMessages() {
      try {
        const token = localStorage.getItem("token"); // Get JWT token from localStorage
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        // Use POST request with body, no query params
        const res = await fetch(`http://localhost:3000/chat/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the JWT token for authentication
          },
          body: JSON.stringify({ chatRoomName: roomId }),
        });

        // Handle non-200 responses
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error:", errorData);
          throw new Error(errorData.error || "Failed to fetch messages");
        }

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          // TypeScript knows `err` is of type `Error` here
          console.error("Error fetching messages:", err.message);
          setError(err.message); // Display more specific error message
        } else {
          // Fallback for non-Error objects
          setError("An unexpected error occurred.");
          console.error("Unexpected error:", err);
        }
        setIsLoading(false);
      }
    }
    fetchMessages();
  }, [roomId]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message); // Send message via WebSocket
      setMessage(""); // Clear input after sending
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="message-list">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : (
          [...(messages || []), ...(socketMessages || [])].map((msg, index) => (
            <div key={index} className="message-item">
              <strong>{msg.user?.username || "Anonymous"}:</strong> {msg.content}
            </div>
          ))
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
