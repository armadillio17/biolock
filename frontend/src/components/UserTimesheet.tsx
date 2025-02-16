import DashboardLayout from "@/layouts/DashboardLayout"
import { Timesheet }  from "@/components/UserDashboardComponent/TimesheetComponent"
import { Button } from "./ui/button"
import { Calendar } from "iconsax-react"

export default function TimesheetReport() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Greetings and time */}
        <div className="flex flex-col text-[#4E4E53]">
          <p className="text-2xl font-bold">Timesheet</p>
        </div>
        <div className="flex flex-col text-[#4E4E53]">
        <Button
          className="w-[187px] h-auto my-2 border-[1px] border-[#028090] rounded-xl"
        > 
          <Calendar size="27" color= "#858585" />
          Date Range 
        </Button>
        </div>
        <div className="w-full h-full mt-2">
          <div className="overflow-hidden border-[1px] border-black rounded-2xl">
            <table className="w-full border-collapse">
              <thead className="font-bold text-[14px] text-gray-700 bg-gray-300">
                  <tr className="flex w-full">
                  <th className="p-3 text-center w-1/6">Date</th>
                  <th className="p-3 text-center w-1/6">Clock In</th>
                  <th className="p-3 text-center w-1/6">Clock Out</th>
                  <th className="p-3 text-center w-1/6">Status</th>
                  <th className="p-3 text-center w-1/6">Total Hours</th>
                  <th className="p-3 text-center w-1/6">Overtime</th>
                  </tr>
              </thead>
            </table>
            <div className="h-[75vh] overflow-auto no-scrollbar">
              <Timesheet />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
  