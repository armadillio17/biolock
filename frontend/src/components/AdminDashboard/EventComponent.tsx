"use client";

import { useNavigate } from "react-router-dom";
import { imgData } from '@/data/ts/dummyData';

export const EventList = () => {
  const navigate = useNavigate();

  const handleView = (id: number) => {
    navigate(`/events/${id}`);
  }

  return (
    <table className="w-full border-collapse">
      <tbody className="text-gray-700">
        {imgData.map((row, index) => (
          <tr
            key={row.id}
            className={`flex w-full border-b ${
              index % 2 === 0 ? "bg-gray-100" : "bg-white"
            } font-normal text-[12px]`}
          >
            <td className="p-4 text-center w-1/5 text-black">{row.date}</td>
            <td className="p-4 text-center w-1/5 text-black">{row.title}</td>
            <td className="p-4 text-center w-1/5 text-black">{row.status}</td>
            <td className="p-4 text-center w-2/5 flex justify-center gap-8">
              <button 
                className="border border-[#CCE5FE] px-5 py-1 rounded-xl text-black hover:bg-blue-100"
                onClick={() => handleView(row.id)}
              >
                View
              </button>
              <button className="border border-[#CCE5FE] px-5 py-1 rounded-xl text-black hover:bg-blue-100">
                Update
              </button>
              <button className="border border-[#CCE5FE] px-5 py-1 rounded-xl text-black hover:bg-blue-100">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};