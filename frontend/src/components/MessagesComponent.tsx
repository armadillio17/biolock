"use client";
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, User } from "lucide-react";
import dummyPic from "@/assets/dummy person.jpg";

interface MessageProps {
  text: string;
  sender: string;
  timestamp: number; // Unix timestamp in milliseconds
  avatarUrl?: string; // Optional avatar image URL
  read?: boolean; // Optional read status
}

const Inbox: React.FC<MessageProps> = ({ 
  text, 
  sender, 
  timestamp, 
  avatarUrl,
  read = true
}) => {
  const formatDate = (date: number) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If message is from today, show time only
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // If message is from this week, show day and time
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { 
        weekday: 'short' 
      }) + ' ' + messageDate.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 transition-all hover:shadow-md ${read ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 mr-3">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={`${sender}'s avatar`}
              className="object-cover w-8 h-8 border border-gray-200 rounded-full sm:w-10 sm:h-10" 
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full sm:w-10 sm:h-10">
              <User size={20} className="text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{sender}</span>
            <span className="text-xs text-gray-500">{formatDate(timestamp)}</span>
          </div>
        </div>
      </div>
      <div className="pl-11 sm:pl-13">
        <div className="mb-1 text-sm text-gray-700 sm:text-base line-clamp-2">{text}</div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="p-4 mb-4 bg-gray-100 rounded-full">
      <Search size={24} className="text-gray-400" />
    </div>
    <h3 className="mb-1 text-lg font-medium text-gray-700">No messages found</h3>
    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
  </div>
);

function Message() {
  // Sample messages
  const initialMessages: MessageProps[] = [
    {
      text: "Hey there! I was wondering if you had time to catch up about the project we discussed last week. There are a few things I'd like to go over.",
      sender: "Alice Smith",
      timestamp: Date.now() - 2 * 86400000, // 2 days ago
      avatarUrl: dummyPic,
      read: true,
    },
    {
      text: "Hello, how are you? I've been reviewing the documents you sent and have a few questions about the implementation timeline.",
      sender: "Bob Johnson",
      timestamp: Date.now() - 300000, // 5 minutes ago
      avatarUrl: dummyPic,
      read: false,
    },
    {
      text: "Doing well, thanks! Just wanted to confirm our meeting for tomorrow at 2pm. Please let me know if that still works for you.",
      sender: "Alice Smith",
      timestamp: Date.now() - 86400000, // 1 day ago
      avatarUrl: dummyPic,
      read: true,
    },
    {
      text: "I've finished the design mockups for the new feature. Would love to get your feedback before I share with the rest of the team.",
      sender: "Clara Davis",
      timestamp: Date.now() - 7200000, // 2 hours ago
      avatarUrl: dummyPic,
      read: false,
    },
    {
      text: "Just a reminder that we need to submit the quarterly report by Friday. Let me know if you need any help gathering the data.",
      sender: "David Wilson",
      timestamp: Date.now() - 172800000, // 2 days ago
      avatarUrl: dummyPic,
      read: true,
    },
  ];

  const [messages ] = useState<MessageProps[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<MessageProps[]>(initialMessages);
  const [showFilters, setShowFilters] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);

  // Filter messages when search query or filters change
  useEffect(() => {
    let results = messages;
    
    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        msg => 
          msg.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
          msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter unread messages
    if (filterUnread) {
      results = results.filter(msg => !msg.read);
    }
    
    setFilteredMessages(results);
  }, [searchQuery, messages, filterUnread]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterUnread(false);
  };

  return (
    <div className="px-4 py-4 mx-auto text-gray-800 sm:px-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Messages</h1>
      
      {/* Search and filters */}
      <div className="mb-4">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <button 
            onClick={toggleFilters}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            <ChevronDown 
              size={18} 
              className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <div className="p-3 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="unread"
                checked={filterUnread}
                onChange={() => setFilterUnread(!filterUnread)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="unread" className="ml-2 text-sm text-gray-700">
                Show unread only
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages list */}
      <div className="space-y-1">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg, idx) => (
            <Inbox
              key={idx}
              text={msg.text}
              sender={msg.sender}
              timestamp={msg.timestamp}
              avatarUrl={msg.avatarUrl}
              read={msg.read}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default Message;