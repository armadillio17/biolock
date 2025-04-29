import { useState, useEffect } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "./ui/button";
import { Calendar } from "./CalendarComponent";
import LeaveRequestModal from "./UserPrompt/LeaveRequestPrompt";
import { leaveRequestStore } from '@/store/leaveRequestStore';
import { useAuthStore } from '@/store/authStore.ts';

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
  const leaveRequestList = userLeaveRequest.filter((leave) => leave.start_date === selectedDate || leave.end_date === selectedDate);

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col-2 gap-4 items-center text-[#4E4E53]">
          <p className="text-2xl font-bold">Leave Request</p>
          <Button
            className="w-auto h-auto my-2 border-[1px] border-[#028090] rounded-xl text-[12px] font-medium"
            onClick={handleOpenModal} // Open modal on button click
          >
            Request Leave
          </Button>
        </div>
        <div>
          <Calendar onDateSelect={handleDateSelect} /> 
        </div>
      </div>

      {/* Table for Leave Requests */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              {/* <th className="py-3 px-6 text-center">Name</th> */}
              <th className="py-3 px-6 text-center">Leave Type</th>
              <th className="py-3 px-6 text-center">Start Date</th>
              <th className="py-3 px-6 text-center">End Date</th>
              <th className="py-3 px-6 text-center">Reason</th>
              <th className="py-3 px-6 text-center"></th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {leaveRequestList && leaveRequestList.length > 0 ? (
              leaveRequestList.map((leave, index) => (
                <tr key={index} className="border-b border-gray-300 hover:bg-gray-100">
                  {/* <td className="py-3 px-6 text-center">{leave.id}</td> */}
                  <td className="py-3 px-6 text-center">{leave.type}</td>
                  <td className="py-3 px-6 text-center">{leave.start_date}</td>
                  <td className="py-3 px-6 text-center">{leave.end_date}</td>
                  <td className="py-3 px-6 text-center">{leave.details}</td>
                  <td className="py-3 px-6 text-center">
                      <span className={`px-4 py-2 rounded-full text-[14px] font-medium ${
                        leave.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : leave.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-gray-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-gray-300 hover:bg-gray-100">
                <td className="py-3 px-6" colSpan={7}>No Leave Request Found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  );
}
