import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { Calendar } from "iconsax-react";
import { EventList } from "./AdminDashboard/EventComponent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminEvent() {
  // Fix the dateRange type to be properly typed for DatePicker
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Close picker when clicking outside - fixed event type
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col p-4">
        {/* Header Section */}
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold text-[#4E4E53]">Events</h2>
          <Button className="bg-[#77DD77] text-white px-6 py-2 rounded-lg hover:bg-[#66CC66] ml-[10px]">
            Create Event
          </Button>
        </div>

        {/* Date Range Button */}
        <div className="relative mb-4" ref={pickerRef}>
          <Button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 border border-[#028090] rounded-xl px-4 py-2 w-[278px]"
          >
            <Calendar size="27" color="#858585" />
            Date Range
          </Button>

          {showDatePicker && (
            <div className="flex flex-col absolute left-0 mt-2 bg-white p-4 shadow-lg rounded-lg border border-gray-300 z-50 w-[278px]">
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                isClearable={true}
                inline
              />
              <Button
                onClick={() => setShowDatePicker(false)}
                className="bg-[#028090] text-white px-4 py-2 rounded-lg mt-2 w-full"
              >
                Apply Filter
              </Button>
            </div>
          )}
        </div>

        {/* Events Table */}
        <div className="w-full bg-white border border-gray-300 shadow-sm rounded-2xl">
          <table className="w-full border-collapse">
            <thead className="text-sm text-gray-700 bg-gray-300">
              <tr>
                <th className="w-1/5 p-3 text-center">Date</th>
                <th className="w-1/5 p-3 text-center">Title</th>
                <th className="w-1/5 p-3 text-center">Status</th>
                <th className="w-2/5 p-3 text-center">Actions</th>
              </tr>
            </thead>
          </table>
          <div className="h-[65vh] overflow-auto">
            {/* Make sure EventList accepts startDate and endDate props, or pass them as needed */}
            <EventList
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}