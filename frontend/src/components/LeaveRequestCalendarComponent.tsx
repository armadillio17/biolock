import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface CalendarProps {
  onDateSelect: (date: string) => void;
  leaveRequestsByDate?: Record<string, { status: string | null }[]>;
}

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);

export const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  leaveRequestsByDate = {},
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const updateMonth = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const updateYear = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

  const getDaysInMonth = (m: number, y: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) =>
    new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);
  const prevMonthDays = getDaysInMonth((month - 1 + 12) % 12, month === 0 ? year - 1 : year);

  const handleDateSelect = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    setSelectedDate(dateStr);
    onDateSelect(dateStr);
  };

  const renderDays = () => {
    const prev = Array.from({ length: firstDay }, (_, i) => (
      <div
        key={`prev-${i}`}
        className="flex items-center justify-center h-12 text-sm text-gray-300"
      >
        {prevMonthDays - firstDay + i + 1}
      </div>
    ));

    const current = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${(month + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const isSelected = dateStr === selectedDate;

      const requests = leaveRequestsByDate[dateStr] || [];
      const pendingCount = requests.filter(
        (req) => !req.status || req.status.trim() === ""
      ).length;
      const hasLeave = requests.some((req) => req.status === "pending");

      let dayClass = `relative flex items-center justify-center rounded-xl transition-all h-12 cursor-pointer `;
      if (isToday) {
        dayClass += "bg-blue-600 text-white font-bold";
      } else if (isSelected) {
        dayClass += "bg-blue-100 text-blue-800 font-semibold";
      } else {
        dayClass += "hover:bg-blue-50 text-gray-800";
      }

      return (
        <div key={`day-${day}`} className={dayClass} onClick={() => handleDateSelect(day)}>
          <span>{day}</span>
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
          {hasLeave && (
            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-yellow-400" />
          )}
        </div>
      );
    });

    const total = prev.length + current.length;
    const next = Array.from({ length: 42 - total }, (_, i) => (
      <div
        key={`next-${i}`}
        className="flex items-center justify-center h-12 text-sm text-gray-300"
      >
        {i + 1}
      </div>
    ));

    return [...prev, ...current, ...next];
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={month.toString()}
          onValueChange={(val) => updateMonth(parseInt(val))}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((name, idx) => (
              <SelectItem key={idx} value={idx.toString()}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(val) => updateYear(parseInt(val))}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 101 }, (_, i) => {
              const y = today.getFullYear() - 50 + i;
              return (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-semibold">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
};
