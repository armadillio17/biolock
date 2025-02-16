import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"
import { Calendar } from "./CalendarComponent"

export default function LeaveRequest() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col-2 gap-4 items-center text-[#4E4E53]">
          <p className="text-2xl font-bold">Leave Request</p>
          <Button
          className="w-auto h-auto my-2 border-[1px] border-[#028090] rounded-xl text-[12px] font-meduim"
        > 
          Request Leave
        </Button>
        </div>
        <Calendar />
      </div>
    </DashboardLayout>
  )
}
  