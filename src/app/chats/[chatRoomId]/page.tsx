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
  const { sendMessage, messages: socketMessages } = useSocket(roomId); // Pass the string to useSocket

  // Fetch chat room message history
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?chatRoomId=${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load messages.");
        setIsLoading(false);
      }
    }
    fetchMessages();
  }, [roomId]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
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
              <strong>{msg.user?.username || "Anonymous"}:</strong>{" "}
              {msg.content}
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
