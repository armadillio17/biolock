"use client";
import { useEffect, useState } from "react";
import { useAttendanceStore } from "@/store/attendanceStore";
import { MessageSquare, Timer } from "lucide-react";
import { Button } from "../ui/button"

interface Message {
  id: number;
  text: string;
  timestamp: string;
}

export const Metrics = () => {
  const { userAttendance, clockInUser, clockOutUser, fetchUserAttendance, isLoading } =
    useAttendanceStore();

  useEffect(() => {
    fetchUserAttendance();
  }, [fetchUserAttendance]);

  const [isClockIn, setIsClockIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Remember to take your lunch break!", timestamp: "10:00 AM" },
    { id: 2, text: "Team meeting at 2 PM", timestamp: "09:30 AM" },
  ]);

  const handleClockInOut = async () => {
    if (isClockIn) {
      await clockOutUser();
      setIsClockIn(false);
      setStartTime(null);
    } else {
      await clockInUser();
      setIsClockIn(true);
      setStartTime(new Date());
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-4">
          {/* Clock In/Out Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold">Time Tracking</h2>
            <Button
                onClick={handleClockInOut}
                disabled={isLoading}
                className={`flex items-center px-6 py-3 rounded-full text-white transition-colors ${
                    isClockIn ? "bg-[#FF6962] hover:bg-[#b74f49]" : "bg-[#487F47] hover:bg-[#00572E]"
                }`}
                >
                <Timer className="mr-2" size={20} />
                {isClockIn ? "Clock Out" : "Clock In"}
            </Button>
            </div>

            {startTime && isClockIn && (
              <p className="mt-4 text-gray-600">
                Clocked in at: <strong>{startTime.toLocaleTimeString()}</strong>
              </p>
            )}
          </div>

          {/* Messages Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <MessageSquare className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <p className="text-gray-700">{message.text}</p>
                    <p className="text-sm text-gray-500 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};