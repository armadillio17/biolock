"use client";
import { useEffect, useState } from "react";
import { useAttendanceStore } from "@/store/attendanceStore";
import { Timer } from "lucide-react";
import { Button } from "../ui/button";
import TimeTracker from '@/components/UserDashboardComponent/TimeTracker';

export const Metrics = () => {
  const {
    clockInUser,
    clockOutUser,
    fetchUserAttendance,
    checkUserClockIn,
    isLoading,
  } = useAttendanceStore();

  const [isClockIn, setIsClockIn] = useState(false);
  const [isClockOut, setIsClockOut] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchUserAttendance();
  }, [fetchUserAttendance]);

  useEffect(() => {
    const checkClockInOnce = async () => {
      const result = await checkUserClockIn();
      if (result?.has_clocked_in && !result?.is_clockOut) {
        setIsClockIn(true);
        setIsClockOut(false);
        if (result.clock_in) {
          setStartTime(new Date(result.clock_in));
        }
      } else if (result?.has_clocked_in && result?.is_clockOut) {
        setIsClockIn(false);
        setIsClockOut(true);
        if (result.clock_in) {
          setStartTime(new Date(result.clock_in));
        }
        if (result.clock_out) {
          setEndTime(new Date(result.clock_out));
        }
      }
    };

    checkClockInOnce();
  }, [checkUserClockIn]);

  const handleClockInOut = async () => {
    if (isClockIn) {
      // Show confirmation before clocking out
      setShowConfirmModal(true);
    } else {
      await clockInUser();
      setIsClockIn(true);
      setIsClockOut(false);
      setStartTime(new Date());
    }
  };
  
  const confirmClockOut = async () => {
    await clockOutUser();
    setIsClockIn(false);
    setIsClockOut(true);
    setEndTime(new Date());
    setShowConfirmModal(false);
  };
  
  const cancelClockOut = () => {
    setShowConfirmModal(false);
  };

  const workQuotes = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "The best way to get started is to quit talking and begin doing.",
    "Don't let yesterday take up too much of today.",
    "You learn more from failure than from success.",
    "Hard times create strong people.",
    "Effort is what leads you to mastery.",
    "Work hard in silence, let success make the noise.",
    "Opportunities don't happen, you create them.",
    "Your time is limited, so don’t waste it living someone else’s life.",
    "Start where you are. Use what you have. Do what you can."
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * workQuotes.length);
    return workQuotes[randomIndex];
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-4">
          {/* Clock In/Out Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Motivational Quote */}
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                <p className="italic text-gray-700">"{getRandomQuote()}"</p>
              </div>

              {/* {!startTime && (
                <p className="text-gray-600">
                  You're not currently clocked in.
                </p>
              )}

              {startTime && !endTime && (
                <p className="text-green-600 font-medium">
                  You're currently clocked in.
                </p>
              )}

              {startTime && endTime && (
                <p className="text-red-600 font-medium">
                  You're currently clocked out.
                </p>
              )} */}
              
              <Button
                onClick={handleClockInOut}
                disabled={isLoading || isClockOut}
                className={`flex items-center px-6 py-3 rounded-full text-white transition-colors ${
                  isClockIn
                    ? "bg-[#FF6962] hover:bg-[#b74f49]"
                    : "bg-[#487F47] hover:bg-[#00572E]"
                }`}
              >
                <Timer className="mr-2" size={20} />
                {isClockIn ? "Clock Out" : "Clock In"}
              </Button>
            </div>
          </div>

          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                <p className="mb-6 text-gray-600">Do you want to clock out?</p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={cancelClockOut}>
                    Cancel
                  </Button>
                  <Button className="bg-[#FF6962] hover:bg-[#b74f49]" onClick={confirmClockOut}>
                    Yes, Clock Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Additional Content */}
      <TimeTracker
        clockInTime={startTime}
        clockOutTime={endTime}
        isTracking={isClockIn}
      />
    </div>
  );
};
