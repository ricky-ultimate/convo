"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage } = useSocket("room-1"); // Use your room ID logic

  const handleSend = () => {
    sendMessage(message);
    setMessage(""); // Clear the input field after sending
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className="message-item">
            {msg.message}
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
