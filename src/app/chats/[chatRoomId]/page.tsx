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

        // Use GET request with roomId as a query parameter
        const res = await fetch(`http://localhost:3000/chat/messages?chatRoomName=${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the JWT token for authentication
          },
        });

        // Handle non-200 responses
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error:", errorData);
          throw new Error(errorData.error || "Failed to fetch messages");
        }

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []); // Update messages state
        setIsLoading(false); // Set loading to false
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching messages:", err.message);
          setError(err.message); // Set error message
        } else {
          setError("An unexpected error occurred.");
          console.error("Unexpected error:", err);
        }
        setIsLoading(false); // Set loading to false on error
      }
    }
    fetchMessages(); // Call fetch function
  }, [roomId]); // Dependency array, re-fetch if roomId changes

  // Add event listener for 'Enter' key to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message.trim()) {
      handleSend(); // Trigger send message on Enter key press
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message); // Send message via WebSocket
      setMessage(""); // Clear input after sending
    } else {
      console.error("Cannot send empty message");
    }
  };

  // Display error message if exists
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
          onChange={(e) => setMessage(e.target.value)} // Update message state on input change
          placeholder="Type a message..."
          onKeyDown={handleKeyPress} // Listen for Enter key to send message
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
