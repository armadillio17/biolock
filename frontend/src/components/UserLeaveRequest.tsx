import { useState } from 'react';
import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { Calendar } from "./CalendarComponent"
import LeaveRequestModal from "./UserLeaveRequestComponent/LeaveRequestPrompt";

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

      {/* Leave Request Modal */}
      <LeaveRequestModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DashboardLayout>
  );
}