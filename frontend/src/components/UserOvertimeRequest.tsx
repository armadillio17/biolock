import DashboardLayout from "@/layouts/DashboardLayout"
import { Button } from "./ui/button"

export default function OvertimeRequest() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col-2 gap-4 items-center text-[#4E4E53]">
          <p className="text-2xl font-bold">Overtime</p>
          <Button
          className="w-auto h-auto my-2 border-[1px] border-[#028090] rounded-xl text-[12px] font-meduim"
        > 
          Request Overtime
        </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
  