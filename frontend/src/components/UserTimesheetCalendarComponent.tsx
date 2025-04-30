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
  statusByDate?: Record<string, "working" | "absent" | "leave" | "holiday" | "dayoff">;
}

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect, statusByDate = {} }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const updateMonth = (newMonth) => {
    setCurrentDate(new Date(year, parseInt(newMonth), 1));
  };

  const updateYear = (newYear) => {
    setCurrentDate(new Date(parseInt(newYear), month, 1));
  };

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m, y) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);
  const prevMonthDays = getDaysInMonth(
    (month - 1 + 12) % 12,
    month === 0 ? year - 1 : year
  );

  const handleDateSelect = (day) => {
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
      const status = statusByDate[dateStr];

      let dayClass = "relative flex items-center justify-center rounded-xl transition-all h-12 cursor-pointer ";
      let indicatorColor = "";

      if (isToday) {
        dayClass += "bg-blue-600 text-white font-bold ";
      } else if (isSelected) {
        dayClass += "bg-blue-100 text-blue-800 font-semibold ";
      } else {
        dayClass += "hover:bg-blue-50 text-gray-800 ";

        // Add status-based background colors
        switch (status) {
          case "working":
            dayClass += "bg-green-100 ";
            indicatorColor = "bg-green-500";
            break;
          case "absent":
            dayClass += "bg-red-100 ";
            indicatorColor = "bg-red-500";
            break;
          case "leave":
            dayClass += "bg-yellow-100 ";
            indicatorColor = "bg-yellow-500";
            break;
          case "holiday":
            dayClass += "bg-blue-100 ";
            indicatorColor = "bg-blue-500";
            break;
          case "dayoff":
            dayClass += "bg-gray-200 ";
            indicatorColor = "bg-gray-500";
            break;
          default:
            break;
        }
      }

      return (
        <div key={`day-${day}`} className={dayClass} onClick={() => handleDateSelect(day)}>
          <span>{day}</span>
          {status && (
            <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
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
          onValueChange={(val) => updateMonth(val)}
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
          onValueChange={(val) => updateYear(val)}
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

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-green-500 rounded-full"></span>
          <span>Working</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-red-500 rounded-full"></span>
          <span>Absent</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-yellow-500 rounded-full"></span>
          <span>Leave</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-blue-500 rounded-full"></span>
          <span>Holiday</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-gray-500 rounded-full"></span>
          <span>Day Off</span>
        </div>
      </div>
    </div>
  );
}