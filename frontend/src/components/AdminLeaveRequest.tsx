import { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { Calendar } from "@/components/LeaveRequestCalendarComponent";
import LeaveRequestModal from "./UserPrompt/LeaveRequestPrompt";
import { leaveRequestStore } from '@/store/leaveRequestStore';
import { useAuthStore } from '@/store/authStore';

export default function LeaveRequest() {
  const { leaveRequest, fetchLeaveRequest, updateLeaveRequest } = leaveRequestStore();
  const { user } = useAuthStore();

  // Date state
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      await fetchLeaveRequest();
      setLoading(false);
    };
    loadRequests();
  }, [fetchLeaveRequest]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchLeaveRequest(); // Refresh data after closing modal
  };

  const handleDateSelect = (date: string) => setSelectedDate(date);

  // Filter leave requests by selected date
  const leaveRequestList = Array.isArray(leaveRequest)
    ? leaveRequest.filter(
        (leave) => leave.start_date === selectedDate || leave.end_date === selectedDate
      )
    : [];

  const leaveRequestsByDate: Record<string, { status: string | null }[]> = {};

  if (Array.isArray(leaveRequest)) {
    leaveRequest.forEach((leave) => {
      const start = leave.start_date;
      if (!leaveRequestsByDate[start]) {
        leaveRequestsByDate[start] = [];
      }
      leaveRequestsByDate[start].push({ status: leave.status });
    });
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Leave Request</h1>
          <Button
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg shadow hover:shadow-md transition-shadow"
            onClick={handleOpenModal}
          >
            Request Leave
          </Button>
        </div>

        {/* Calendar */}
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-200">
          <Calendar onDateSelect={handleDateSelect} leaveRequestsByDate={leaveRequestsByDate} />
        </div>

        {/* Leave Requests Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                  <th scope="col" className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(4)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-block h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : leaveRequestList.length > 0 ? (
                  leaveRequestList.map((leave, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {leave.user.first_name} {leave.user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leave.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leave.start_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leave.end_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{leave.details}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {leave.status === 'pending' && leave.user.id !== Number(user.userId) ? (
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => updateLeaveRequest("approved", leave.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => updateLeaveRequest("declined", leave.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            leave.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : leave.status === 'declined'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {leave.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No leave requests found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <LeaveRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  );
}