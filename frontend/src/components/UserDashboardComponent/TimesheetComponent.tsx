import { base_url } from '@/config';
import { useState, useEffect } from "react";

interface AttendanceData {
  id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  working_hours: number;
  overtime_hours: number;
}

export const Timesheet = () => {

  const [data, setData] = useState<AttendanceData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${base_url}/attendance/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(response.statusText || "No Data Found");
        }

        const jsonData: AttendanceData[] = await response.json();
        setData(jsonData); // Update state, triggering re-render
      } catch (err) {
        console.error("Fetch error:", err instanceof Error ? err.message : err);
      }
    };

    fetchData();
  }, []); // Runs once on mount

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
        {data.map((row, index) => (
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

