"use client";
import React, { useState } from "react";

export const Calendar: React.FC = () => {
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
        className="h-16 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400"
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
        className={`h-16 flex items-center justify-center border border-gray-300 rounded-lg transition duration-200 ease-in-out hover:bg-blue-200 ${
          isToday ? 'bg-blue-300' : ''
        }`}
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
        className="h-16 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400"
      >
        {day}
      </div>
    );
  }
  
  // Combine all days
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  return (
    <div className="flex flex-col p-4 bg-white shadow-lg rounded-lg h-100">
      <div className="flex justify-between items-center mb-4">
        <h2 id="month-name" className="text-xl font-semibold">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <div className="flex space-x-2">
          <button
            id="prev-month-button"
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            &lt;
          </button>
          <button
            id="next-month-button"
            onClick={handleNextMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 overflow-auto">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={index} className="font-bold text-center text-gray-700">{day}</div>
        ))}
        {allDays}
      </div>
    </div>
  );
};