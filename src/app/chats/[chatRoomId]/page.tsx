"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function ChatRoom() {
  const { chatRoomId } = useParams();
  const roomId = Array.isArray(chatRoomId) ? chatRoomId[0] : chatRoomId;
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { sendMessage, messages: socketMessages } = useSocket(roomId);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchMessages() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const res = await fetch(`${apiUrl}/chat/messages?chatRoomName=${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token"); // Clear invalid token
          router.push("/login"); // Redirect to login
          return;
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch messages");
        }

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching messages:", err.message);
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [roomId, router]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    } else {
      console.error("Cannot send empty message");
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="message-list">
        {isLoading ? <p>Loading messages...</p> : [...messages, ...socketMessages].map((msg, index) => (
          <div key={index} className="message-item">
            <strong>{msg?.user?.username || "Anonymous"}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
