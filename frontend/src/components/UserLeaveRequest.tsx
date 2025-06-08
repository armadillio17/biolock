import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { Calendar } from './LeaveRequestCalendarComponent';
import LeaveRequestModal from "./UserPrompt/LeaveRequestPrompt";
import { leaveRequestStore } from '@/store/leaveRequestStore';
import { useAuthStore } from '@/store/authStore';
import { Plus } from 'lucide-react';

export default function LeaveRequest() {
  const { userLeaveRequest, fetchUserLeaveRequest } = leaveRequestStore();
  const { user } = useAuthStore();

  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate()); // Set initial date to today's date
  const userId = user.userId || '';
  const date = selectedDate;

  useEffect(() => {
    fetchUserLeaveRequest(userId, date);
  }, [fetchUserLeaveRequest, user.userId, userId, date]);

  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date); // Update selected date when user clicks on a date
  };

  // Filter leave requests by selected date
  const leaveRequestList = userLeaveRequest.filter((leave) =>
    leave.start_date === selectedDate || leave.end_date === selectedDate
  );

  const leaveRequestsByDate = userLeaveRequest.reduce((acc, leave) => {
    const add = (date: string) => {
      if (!acc[date]) acc[date] = [];
      acc[date].push({ status: leave.status });
    };

    add(leave.start_date);
    if (leave.end_date && leave.end_date !== leave.start_date) {
      add(leave.end_date);
    }

    return acc;
  }, {} as Record<string, { status: string | null }[]>);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Leave Request</h2>

          {/* Add Leave Button */}
          <Button
            onClick={handleOpenModal}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Request Leave
          </Button>
        </div>

        {/* Calendar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Calendar</h3>
          <Calendar onDateSelect={handleDateSelect} leaveRequestsByDate={leaveRequestsByDate} />
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg text-gray-800">
            Leave Requests
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userLeaveRequest.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaveRequestList.map((leave) => (
                    <tr key={leave.id.toString()} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(leave.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.details}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            leave.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : leave.status === 'declined'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-gray-800'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Request Modal */}
        <LeaveRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </DashboardLayout>
  );
}