"use client";
import { useEffect, useRef, useState } from "react";
import { useAttendanceStore, MIN_OUTSIDE_REASON_LEN } from "@/store/attendanceStore";
import { MoreVertical, Timer, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import TimeTracker from '@/components/UserDashboardComponent/TimeTracker';
import useClickOutside from "@/components/hooks/useClickOutside";
import toast from "react-hot-toast";

export const Metrics = () => {
  const {
    clockInUser,
    clockOutUser,
    clearOutsideReasonPrompt,
    clearMobileAppPrompt,
    useMobileAppDevice,
    fetchUserAttendance,
    checkUserClockIn,
    requestOvertime,
    isLoading,
  } = useAttendanceStore();

  const [isClockIn, setIsClockIn] = useState(false);
  const [isClockOut, setIsClockOut] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Punching from outside a work location is allowed, but the server asks for
  // a reason first; "in"/"out" records which action to retry once we have one.
  const [outsideReasonFor, setOutsideReasonFor] = useState<"in" | "out" | null>(null);
  const [outsideReason, setOutsideReason] = useState("");
  const [outsideDistance, setOutsideDistance] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quote, setQuote] = useState("");
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
  });

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

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * workQuotes.length);
    setQuote(workQuotes[randomIndex]);
  }, []);
  
  const handleClockInOut = async () => {
    if (isClockIn) {
      // Show confirmation before clocking out
      setShowConfirmModal(true);
    } else {
      const clockedIn = await clockInUser();
      if (!clockedIn) {
        const { error, outsideReasonRequired, outsideDistanceMeters } =
          useAttendanceStore.getState();

        // Has a bound phone: the modal explains, there is nothing to retry here.
        if (useAttendanceStore.getState().useMobileAppDevice) return;

        // Outside a work location is not a denial -- ask why, then retry.
        if (outsideReasonRequired) {
          setOutsideDistance(outsideDistanceMeters);
          setOutsideReason("");
          setOutsideReasonFor("in");
          return;
        }

        toast.error(error ?? "Unable to clock in");
        return;
      }
      applyClockIn();
    }
  };
  
  const applyClockIn = () => {
    setIsClockIn(true);
    setIsClockOut(false);
    setStartTime(new Date());
  };

  const applyClockOut = () => {
    setIsClockIn(false);
    setIsClockOut(true);
    setEndTime(new Date());
    setShowConfirmModal(false);
  };

  const confirmClockOut = async () => {
    const clockedOut = await clockOutUser();
    if (!clockedOut) {
      const { error, outsideReasonRequired, outsideDistanceMeters } =
        useAttendanceStore.getState();

      if (useAttendanceStore.getState().useMobileAppDevice) {
        setShowConfirmModal(false);
        return;
      }

      if (outsideReasonRequired) {
        setOutsideDistance(outsideDistanceMeters);
        setOutsideReason("");
        setOutsideReasonFor("out");
        setShowConfirmModal(false);
        return;
      }

      toast.error(error ?? "Unable to clock out");
      setShowConfirmModal(false);
      return;
    }
    applyClockOut();
  };

  // Retry the punch that was held back, now carrying the typed reason.
  const submitOutsideReason = async () => {
    const reason = outsideReason.trim();
    if (reason.length < MIN_OUTSIDE_REASON_LEN) return;

    const action = outsideReasonFor;
    const ok = action === "in" ? await clockInUser(reason) : await clockOutUser(reason);

    if (!ok) {
      toast.error(
        useAttendanceStore.getState().error ??
          `Unable to clock ${action === "in" ? "in" : "out"}`,
      );
      return;
    }

    if (action === "in") applyClockIn();
    else applyClockOut();

    setOutsideReasonFor(null);
    setOutsideReason("");
    clearOutsideReasonPrompt();
  };

  const cancelOutsideReason = () => {
    setOutsideReasonFor(null);
    setOutsideReason("");
    clearOutsideReasonPrompt();
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

  const handleRequestOvertime = async () => {
    // Get current time in Asia/Manila (Philippine Time)
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    const phTimeStr = new Intl.DateTimeFormat('en-US', options).format(now);
    const [hourStr] = phTimeStr.split(':');
    const hour = parseInt(hourStr, 10);

    if (hour < 19) {
      alert("⏰ You can only request overtime after 7:00 PM (Philippine Time).");
      return;
    }

    // If after 7 PM, proceed with request
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    try {
      console.log("Calling requestOvertime...");
      await requestOvertime(today);
      alert("✅ Overtime requested successfully!");
    } catch (err) {
      console.error("Failed to request overtime", err);
      alert("❌ Failed to submit overtime request.");
    }
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
                <p className="italic text-gray-700">"{quote}"</p>
              </div>

              {/* Clock Button + 3 Dot Button Group */}
              <div className="relative flex items-center gap-2">
                {/* Existing Clock Button */}
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

                {/* Dropdown Wrapper */}
                <div
                  ref={dropdownRef}
                  className="outline-none"
                >
                  {/* 3-Dot Menu Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-md z-10 px-2">
                      <ul className="py-2">
                        <li
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequestOvertime();
                          }}
                          className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gradient-to-r from-indigo-500 to-cyan-500 hover:text-white cursor-pointer font-medium"
                        >
                          Request Overtime
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {useMobileAppDevice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
              <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-50">
                  <Smartphone className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-center">
                  Use the Biolock app
                </h3>
                <p className="mb-4 text-sm text-center text-gray-600">
                  Your attendance is tied to your registered phone
                  {useMobileAppDevice.device_model
                    ? ` (${useMobileAppDevice.device_model})`
                    : ""}
                  , so please clock in and out from the app.
                </p>
                <p className="mb-6 text-xs text-center text-gray-500">
                  Lost or changed phones? Ask an administrator to release the old one.
                </p>
                <Button className="w-full" onClick={clearMobileAppPrompt}>
                  Got it
                </Button>
              </div>
            </div>
          )}

          {outsideReasonFor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
              <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
                <h3 className="mb-2 text-lg font-semibold">
                  You&apos;re outside the work area
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {outsideDistance !== null
                    ? `You're about ${outsideDistance.toLocaleString()} m from the nearest work location. `
                    : ""}
                  You can still clock {outsideReasonFor === "in" ? "in" : "out"} — just tell us why.
                </p>
                <textarea
                  autoFocus
                  rows={3}
                  value={outsideReason}
                  onChange={(e) => setOutsideReason(e.target.value)}
                  placeholder="e.g. Buying printer ink for the office"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 mb-4 text-xs text-gray-500">
                  {outsideReason.trim().length < MIN_OUTSIDE_REASON_LEN
                    ? `At least ${MIN_OUTSIDE_REASON_LEN} characters (${outsideReason.trim().length}/${MIN_OUTSIDE_REASON_LEN}).`
                    : "This is recorded with your punch for your manager to review."}
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={cancelOutsideReason} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button
                    onClick={submitOutsideReason}
                    disabled={isLoading || outsideReason.trim().length < MIN_OUTSIDE_REASON_LEN}
                  >
                    {isLoading
                      ? "Submitting..."
                      : `Clock ${outsideReasonFor === "in" ? "In" : "Out"}`}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
      <div className="p-4 md:p-4">
        <TimeTracker
          clockInTime={startTime}
          clockOutTime={endTime}
          isTracking={isClockIn}
        />
      </div>
    </div>
  );
};
