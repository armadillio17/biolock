import { useState } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { Calendar } from "./CalendarComponent"
import LeaveRequestModal from "./UserPrompt/LeaveRequestPrompt";

export default function LeaveRequest() {

  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


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
          <Calendar />
        </div>
      </div>

      {/* Table for Leave Requests */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Leave Type</th>
              <th className="py-3 px-6 text-left">Start Date</th>
              <th className="py-3 px-6 text-left">End Date</th>
              <th className="py-3 px-6 text-left">Reason</th>
              <th className="py-3 px-6 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {/* Sample Data Row */}
            <tr className="border-b border-gray-300 hover:bg-gray-100">
              <td className="py-3 px-6">John Doe</td>
              <td className="py-3 px-6">Sick Leave</td>
              <td className="py-3 px-6">2023-10-01</td>
              <td className="py-3 px-6">2023-10-05</td>
              <td className="py-3 px-6">Flu</td>
              <td className="py-3 px-6">Approved</td>
            </tr>
            {/* Add more rows as needed */}
            <tr className="border-b border-gray-300 hover:bg-gray-100">
              <td className="py-3 px-6">Jane Smith</td>
              <td className="py-3 px-6">Vacation Leave</td>
              <td className="py-3 px-6">2023-11-10</td>
              <td className="py-3 px-6">2023-11-15</td>
              <td className="py-3 px-6">Family Trip</td>
              <td className="py-3 px-6">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  );
}