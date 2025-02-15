"use client";

import { table } from '@/data/ts/dummyData';

export const Timesheet = () => {
  return (
    <table className="w-full border-collapse">
        <tbody className="text-gray-700">
        {table.map((row, index) => (
            <tr
            key={row.id}
            className={`flex w-full border-b ${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
            } font-normal text-[10px]`}
            >
            <td className="p-3 text-center w-1/6">{row.date}</td>
            <td className="p-3 text-center w-1/6">{row.clockIn}</td>
            <td className="p-3 text-center w-1/6">{row.clockOut}</td>
            <td className="p-3 text-center w-1/6">{row.status}</td>
            <td className="p-3 text-center w-1/6">{row.totalHours}</td>
            <td className="p-3 text-center w-1/6">{row.overtime}</td>
            </tr>
        ))}
        </tbody>
    </table>
  );
};

