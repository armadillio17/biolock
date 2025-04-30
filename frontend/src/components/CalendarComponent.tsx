"use client";
import React, { useState } from "react";

// Declare a new function for handling the date click
interface CalendarProps {
  onDateSelect: (date: string) => void; // Callback to pass the selected date to parent
}

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const today = new Date();

  // Get days from previous month to display
  const daysInPrevMonth = getDaysInMonth(month - 1 < 0 ? 11 : month - 1, month - 1 < 0 ? year - 1 : year);
  const prevMonthDays: JSX.Element[] = [];

  for (let i = 0; i < firstDay; i++) {
    const prevDay = daysInPrevMonth - firstDay + i + 1;
    const prevMonth = month - 1 < 0 ? 11 : month - 1;
    const prevYear = month - 1 < 0 ? year - 1 : year;

    prevMonthDays.push(
      <div
        key={`prev-${prevDay}`}
        id={`prev-date-${prevDay}`}
        className="flex items-center justify-center text-sm text-gray-400 border border-gray-200 rounded-lg aspect-square md:text-base"
      >
        {prevDay}
      </div>
    );
  }

  // Current month days
  const currentMonthDays: JSX.Element[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    currentMonthDays.push(
      <div
        key={`current-${day}`}
        id={`date-${day}`}
        className={`flex items-center justify-center border border-gray-300 rounded-lg transition duration-200 ease-in-out hover:bg-blue-200 aspect-square text-sm md:text-base ${isToday ? 'bg-blue-300' : ''
          }`}
        onClick={() => onDateSelect(`${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)} // Handle date click
      >
        {day}
      </div>
    );
  }

  // Next month days to fill the grid
  const nextMonthDays: JSX.Element[] = [];
  const totalCurrentDays = firstDay + daysInMonth;
  const remainingCells = 42 - totalCurrentDays; // 6 rows of 7 days = 42 cells

  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const nextYear = month + 1 > 11 ? year + 1 : year;

    nextMonthDays.push(
      <div
        key={`next-${day}`}
        id={`next-date-${day}`}
        className="flex items-center justify-center text-sm text-gray-400 border border-gray-200 rounded-lg aspect-square md:text-base"
      >
        {day}
      </div>
    );
  }

  // Combine all days
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  return (
    <div className="flex flex-col w-full max-w-full p-2 overflow-hidden bg-white rounded-lg shadow-lg md:p-4">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h2 id="month-name" className="text-base font-semibold truncate md:text-xl">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <div className="flex space-x-1 md:space-x-2">
          <button
            id="prev-month-button"
            onClick={handlePrevMonth}
            className="px-2 py-1 text-sm text-white transition duration-200 bg-blue-500 rounded-lg md:px-4 md:py-2 hover:bg-blue-600 md:text-base"
          >
            &lt;
          </button>
          <button
            id="next-month-button"
            onClick={handleNextMonth}
            className="px-2 py-1 text-sm text-white transition duration-200 bg-blue-500 rounded-lg md:px-4 md:py-2 hover:bg-blue-600 md:text-base"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 overflow-auto md:gap-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={index} className="text-xs font-bold text-center text-gray-700 md:text-sm">{day}</div>
        ))}
        {allDays}
      </div>
    </div>
  );
};