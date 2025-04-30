import { useState } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Calendar } from "./CalendarComponent"
import OvertimeRequestModal from "./UserPrompt/OvertimeRequestPrompt";
import { useAuthStore } from '@/store/authStore.ts';

export default function OvertimeRequest() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  useAuthStore();

  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [, setSelectedDate] = useState<string>(getTodayDate()); // Set initial date to today's date

  // Removed unused variables userId and date

  // const handleOpenModal = () => {
  //   setIsModalOpen(true);
  // };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date); // Update selected date when user clicks on a date
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col-2 gap-4 items-center text-[#4E4E53]">
          <p className="text-2xl font-bold">Overtime</p>
          {/* <Button
            className="w-auto h-auto my-2 border-[1px] border-[#028090] rounded-xl text-[12px] font-meduim"
            onClick={handleOpenModal} // Open modal on button click
          >
            Request Overtime
          </Button> */}
        </div>

        <Calendar onDateSelect={handleDateSelect} />
      </div>
      {/* Table for Leave Requests */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="text-sm leading-normal text-gray-600 uppercase bg-gray-200">
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Employee</th>
              <th className="px-6 py-3 text-left">Overtime</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light text-gray-600">
            {/* Sample Data Row */}
            <tr className="border-b border-gray-300 hover:bg-gray-100">
              <td className="px-6 py-3">2024-10-29</td>
              <td className="px-6 py-3">Dave Franciscos</td>
              <td className="px-6 py-3">8 Hours</td>
              <td className="px-6 py-3">Pending</td>
              {/* <td className="px-6 py-3">Flu</td> */}
              {/* <td className="px-6 py-3">Approved</td> */}
            </tr>
            {/* Add more rows as needed */}
            <tr className="border-b border-gray-300 hover:bg-gray-100">
              <td className="px-6 py-3">2023-11-10</td>
              <td className="px-6 py-3">Kenneth Advincula</td>
              <td className="px-6 py-3">8 Hours</td>
              <td className="px-6 py-3">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Overtime Request Modal */}
      <OvertimeRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  )
}