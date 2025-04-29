import { useState } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { Calendar } from "./CalendarComponent"
import OvertimeRequestModal from "./UserPrompt/OvertimeRequestPrompt";
import { useAuthStore } from '@/store/authStore.ts';

export default function OvertimeRequest() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

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
          <Button
            className="w-auto h-auto my-2 border-[1px] border-[#028090] rounded-xl text-[12px] font-meduim"
            onClick={handleOpenModal} // Open modal on button click
          >
            Request Overtime
          </Button>
        </div>

        <Calendar onDateSelect={handleDateSelect} /> 
      </div>
      {/* Table for Leave Requests */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Employee</th>
              <th className="py-3 px-6 text-left">Overtime</th>
              <th className="py-3 px-6 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {/* Sample Data Row */}
            <tr className="border-b border-gray-300 hover:bg-gray-100">
              <td className="py-3 px-6">2024-10-29</td>
              <td className="py-3 px-6">Dave Franciscos</td>
              <td className="py-3 px-6">8 Hours</td>
              <td className="py-3 px-6">Pending</td>
              {/* <td className="py-3 px-6">Flu</td> */}
              {/* <td className="py-3 px-6">Approved</td> */}
            </tr>
            {/* Add more rows as needed */}
            <tr className="border-b border-gray-300 hover:bg-gray-100">
              <td className="py-3 px-6">2023-11-10</td>
              <td className="py-3 px-6">Kenneth Advincula</td>
              <td className="py-3 px-6">8 Hours</td>
              <td className="py-3 px-6">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Overtime Request Modal */}
      <OvertimeRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  )
}
