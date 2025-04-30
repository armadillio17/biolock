import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout";
import { Calendar } from "@/components/UserTimesheetCalendarComponent";
import { useAttendanceStore } from '@/store/attendanceStore';

export default function TimesheetReport() {
  const {userAttendance, fetchUserAttendance } = useAttendanceStore();
  type AttendanceStatus = "working" | "absent" | "leave" | "holiday" | "dayoff";

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



const userAttendanceList = Array.isArray(userAttendance)
? userAttendance.filter(
    (userAttendance) => userAttendance.date === selectedDate
  )
: []; // If not an array yet, just return an empty list

  const status: Record<string, AttendanceStatus> = Array.isArray(userAttendance)
    ? userAttendance.reduce((acc, curr) => {
      if (curr.date && curr.status) {
        acc[curr.date] = curr.status as AttendanceStatus;
      }
      return acc;
    }, {} as Record<string, AttendanceStatus>)
    : {};

  return (
    <DashboardLayout>
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col text-[#4E4E53] mb-4">
          <p className="text-2xl font-bold">Timesheet</p>
        </div>

        {/* Calendar Component */}
        <Calendar onDateSelect={handleDateSelect} statusByDate={status} />

        {/* Attendance Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="text-sm leading-normal text-gray-600 uppercase bg-gray-200">
                <th className="px-6 py-3 text-center">Clock In</th>
                <th className="px-6 py-3 text-center">Clock Out</th>
                <th className="px-6 py-3 text-center">Working Hours</th>
                <th className="px-6 py-3 text-center">Overtime Hours</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-light text-gray-600">
              {userAttendanceList.length > 0 ? (
                userAttendanceList.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-300 hover:bg-gray-100">
                    <td className="px-6 py-3 text-center">
                      {entry.clock_in ? new Date(entry.clock_in).toLocaleString() : '--'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {entry.clock_out ? new Date(entry.clock_out).toLocaleString() : '--'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {entry.working_hours ?? '--'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {entry.overtime_hours ?? '--'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {entry.status ?? '--'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-300 hover:bg-gray-100">
                  <td colSpan={5} className="px-6 py-3 text-center">No attendance data for selected date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
