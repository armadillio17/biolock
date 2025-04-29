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
          <Calendar onDateSelect={handleDateSelect} statusByDate={status}/> 
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-center">Clock In</th>
                  <th className="py-3 px-6 text-center">Clock Out</th>
                  <th className="py-3 px-6 text-center">Working Hours</th>
                  <th className="py-3 px-6 text-center">Overtime Hours</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center"></th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {userAttendanceList && userAttendanceList.length > 0 ? (
                  userAttendanceList.map((attendance, index) => (
                    <tr key={index} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 px-6 text-center">
                      {attendance.clock_in
                        ? new Date(attendance.clock_in).toLocaleString()
                        : '-- -- --'}
                      </td>
                      <td className="py-3 px-6 text-center">
                      {attendance.clock_out
                        ? new Date(attendance.clock_out).toLocaleString()
                        : '-- -- --'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        {attendance.working_hours ?? '-- -- --' }</td>
                      <td className="py-3 px-6 text-center">{attendance.overtime_hours ?? '-- -- --'}</td>
                      <td className="py-3 px-6 text-center">{attendance.status ?? '-- -- --'}</td>

                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-6 text-center" colSpan={6}>No Attendance Found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </DashboardLayout>
  )
}
  