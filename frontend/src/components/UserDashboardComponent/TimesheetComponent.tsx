// import { base_url } from '@/config';
import { useEffect } from "react";
import { useAttendanceStore } from "@/store/attendanceStore";

export const Timesheet = () => {

  const { attendance, fetchAttendanceList } = useAttendanceStore();

  useEffect(() => {
   fetchAttendanceList();
  }, [fetchAttendanceList]);

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return "N/A"; // Handle null values
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  return (
    <table className="w-full border-collapse">
        <tbody className="text-gray-700">
        {attendance.map((row, index) => (
            <tr
            key={row.id}
            className={`flex w-full border-b ${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
            } font-normal text-[10px]`}
            >
            <td className="p-3 text-center w-1/6">{row.date}</td>
            <td className="p-3 text-center w-1/6">{formatTime(row.clock_in)}</td>
            <td className="p-3 text-center w-1/6">{formatTime(row.clock_out)}</td>
            <td className="p-3 text-center w-1/6">{row.status}</td>
            <td className="p-3 text-center w-1/6">{row.working_hours}</td>
            <td className="p-3 text-center w-1/6">{row.overtime_hours}</td>
            </tr>
        ))}
        </tbody>
    </table>
  );
};

