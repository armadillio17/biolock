"use client";

import React from 'react';

interface MessageProps {
  text: string;
  sender: string;
  timestamp: number; // Assuming timestamp is a Unix timestamp in milliseconds
}

const Message: React.FC<MessageProps> = ({ text, sender, timestamp }) => {
  const formatDate = (date: number) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-2 bg-gray-100">
      <div className="font-bold mb-1">{sender}</div>
      <div className="mb-1">{text}</div>
      <div className="text-sm text-gray-500">{formatDate(timestamp)}</div>
    </div>
  );
};

export default Message;