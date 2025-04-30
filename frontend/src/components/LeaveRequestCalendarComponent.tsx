import React, { useState } from "react";

interface CalendarProps {
  onDateSelect: (date: string) => void;
  leaveRequestsByDate?: Record<string, { status: string | null }[]>;
}

const months = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect, leaveRequestsByDate = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const today = new Date();

  const updateMonth = (newMonth: number) => {
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const updateYear = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

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
    const prev = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1).map(
      (day) => (
        <div
          key={`prev-${day}`}
          className="h-16 flex items-center justify-center rounded-lg text-gray-400"
        >
          {day}
        </div>
      )
    );
    const current = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const isSelected = dateStr === selectedDate;

      const requests = leaveRequestsByDate[dateStr] || [];
      const pendingCount = requests.filter((req) => !req.status || req.status.trim() === "").length;
      const hasLeave = requests.some((req) => req.status === "pending");

      let statusClass = "";
      if (hasLeave) {
        statusClass = "bg-yellow-100 border-yellow-400";
      }

      return (
        <div
          key={`day-${day}`}
          className={`relative h-16 flex items-center justify-center border rounded-[25px] cursor-pointer transition 
            ${isToday ? "bg-blue-600 text-white font-bold" : 
            isSelected ? "bg-blue-300 text-blue-800 font-semibold" : 
            "hover:bg-blue-300"} ${statusClass}`}
          onClick={() => handleDateSelect(day)}
        >
          <span>{day}</span>
          {pendingCount > 0 && (
            <span className="absolute top-1 right-2 text-xs bg-red-500 text-white rounded-full px-1">
              {pendingCount}
            </span>
          )}
        </div>
      );
    });

    const total = prev.length + current.length;
    const next = Array.from({ length: 42 - total }, (_, i) => (
      <div
        key={`next-${i + 1}`}
        className="h-16 flex items-center justify-center rounded-lg text-gray-400"
      >
        {i + 1}
      </div>
    ));

    return [...prev, ...current, ...next];
  };

  return (
    <div className="flex flex-col p-4 border shadow-lg rounded-xl">
      <div className="flex space-x-4 mb-4">
        <div className="relative">
          <select
            value={month}
            onChange={(e) => updateMonth(parseInt(e.target.value))}
            className="text-xl appearance-none overflow-hidden bg-grey-200 border border-black text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {months.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={year}
            onChange={(e) => updateYear(parseInt(e.target.value))}
            className="text-xl appearance-none overflow-hidden bg-grey-200 border border-black text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Array.from({ length: 101 }, (_, i) => {
              const y = today.getFullYear() - 50 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 p-4 bg-blue-200 rounded-[25px]"
          >
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};
