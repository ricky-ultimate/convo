"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function ChatRoom() {
  const { chatRoomId } = useParams(); // Dynamic room ID from URL

  // Ensure chatRoomId is a string, even if it's returned as string[]
  const roomId = Array.isArray(chatRoomId) ? chatRoomId[0] : chatRoomId;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const { sendMessage, messages: socketMessages } = useSocket(roomId); // Pass the string to useSocket

  // Fetch chat room message history
  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/messages?chatRoomId=${roomId}`);
      const data = await res.json();
      setMessages(data);
    }

    fetchMessages();
  }, [roomId]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message); // Send message via WebSocket
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {/* Combine past messages and real-time messages */}
        {[...messages, ...socketMessages].map((msg, index) => (
          <div key={index} className="message-item">
            <strong>{msg.user?.username || "Anonymous"}:</strong> {msg.content}
          </div>
        ))}
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
