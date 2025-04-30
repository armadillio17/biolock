import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
// import { Timesheet }  from "@/components/UserDashboardComponent/TimesheetComponent"
// import { Button } from "./ui/button"
// import { Calendar } from "iconsax-react"
import { Calendar } from "@/components/UserTimesheetCalendarComponent"
import { useAttendanceStore } from '@/store/attendanceStore';

export default function TimesheetReport() {

    const {userAttendance, fetchUserAttendance, isLoading } = useAttendanceStore();
  
    useEffect(() => {
          fetchUserAttendance();
    }, [fetchUserAttendance]);

  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate()); // ✅ added state for selectedDate

  const handleDateSelect = (date: string) => {
    setSelectedDate(date); // Update selected date when user clicks on a date
  };

  console.log("userAttendance", userAttendance);
  

  const userAttendanceList = Array.isArray(userAttendance)
  ? userAttendance.filter(
      (userAttendance) => userAttendance.date === selectedDate
    )
  : []; // If not an array yet, just return an empty list

  const status = Array.isArray(userAttendance)
  ? userAttendance.reduce((acc: Record<string, string>, curr) => {
      if (curr.date && curr.status) {
        acc[curr.date] = curr.status;
      }
      return acc;
    }, {})
  : {};

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Timesheet</p>
        </div>
        <div className="w-full h-full mt-2">
          <div className="overflow-x-auto border-[1px] border-black rounded-2xl">
            <table className="w-full border-collapse">
              <thead className="font-bold text-[14px] text-gray-700 bg-gray-300">
                  <tr className="flex w-full">
                  <th className="p-3 text-center w-1/7">Date</th>
                  <th className="p-3 text-center w-1/7">Clock In</th>
                  <th className="p-3 text-center w-1/7">Clock Out</th>
                  <th className="p-3 text-center w-1/7">Status</th>
                  <th className="p-3 text-center w-1/7">Total Hours</th>
                  <th className="p-3 text-center w-1/7">Overtime</th>
                  </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>
      
    </DashboardLayout>
  )
}
  