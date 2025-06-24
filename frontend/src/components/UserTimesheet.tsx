import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout";
import { Calendar } from "@/components/UserTimesheetCalendarComponent";
import { useAttendanceStore } from '@/store/attendanceStore';

export default function TimesheetReport() {
  const { userAttendance, fetchUserAttendance } = useAttendanceStore();
  type AttendanceStatus = "working" | "absent" | "leave" | "holiday" | "dayoff";

  // Load attendance data on mount
  useEffect(() => {
    fetchUserAttendance();
  }, [fetchUserAttendance]);

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Filter attendance by selected date
  const userAttendanceList = Array.isArray(userAttendance)
    ? userAttendance.filter((entry) => entry.date === selectedDate)
    : [];

  // Map status by date for calendar
  const statusByDate = Array.isArray(userAttendance)
    ? userAttendance.reduce((acc, curr) => {
        if (curr.date && curr.status) {
          acc[curr.date] = curr.status as AttendanceStatus;
        }
        return acc;
      }, {} as Record<string, AttendanceStatus>)
    : {};

  // Status badge color mapping
  const getStatusColor = (status: string | null | undefined): string => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      case 'holiday':
        return 'bg-purple-100 text-purple-800';
      case 'dayoff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Timesheet</h1>
        </div>

        {/* Calendar Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h2>
          <Calendar onDateSelect={handleDateSelect} statusByDate={statusByDate} />
        </div>

        {/* Attendance Table Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
            Attendance Records for {formatDate(selectedDate)}
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Overtime
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userAttendanceList.length > 0 ? (
                  userAttendanceList.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString() : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {entry.working_hours ?? '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {entry.overtime_hours ?? '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1) || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No attendance records found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}