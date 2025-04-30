"use client";

import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";

interface MessageProps {
  text: string;
  sender: string;
  timestamp: number; // Unix timestamp in milliseconds
}

const MessageItem: React.FC<MessageProps> = ({ text, sender, timestamp }) => {
  const formatDate = (date: number) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-2 bg-gray-100">
      <div className="font-bold mb-1">{sender}</div>
      <div className="mb-1">{text}</div>
      <div className="text-sm text-gray-500">{formatDate(timestamp)}</div>
    </div>
  );
};

function Message() {
  // Sample messages
  const messages: MessageProps[] = [
    {
      text: "Hey there!",
      sender: "Alice",
      timestamp: Date.now() - 600000, // 10 mins ago
    },
    {
      text: "Hello, how are you?",
      sender: "Bob",
      timestamp: Date.now() - 300000, // 5 mins ago
    },
    {
      text: "Doing well, thanks!",
      sender: "Alice",
      timestamp: Date.now(), // now
    },
  ];

  return (
      <div className="flex flex-col text-[#4E4E53] mt-5">
        <div className="mt-6 overflow-x-auto">
          {messages.map((msg, idx) => (
            <MessageItem
              key={idx}
              text={msg.text}
              sender={msg.sender}
              timestamp={msg.timestamp}
            />
          ))}
        </div>
      </div>
  );
}

export default Message;
