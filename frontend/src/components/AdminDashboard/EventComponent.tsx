"use client";

import { useNavigate } from "react-router-dom";
import { imgData } from '@/data/ts/dummyData';

export const EventList = () => {
  const navigate = useNavigate();

  const handleView = (id: number) => {
    navigate(`/events/${id}`);
  };

  return (
    <table className="w-full border-collapse"> 
      <tbody className="text-gray-700">
        {imgData.map((row, index) => (
          <tr
            key={row.id}
            className={`border-b ${
              index % 2 === 0 ? "bg-[#E6F0FA]" : "bg-white"
            } text-[14px]`}
          >
            <td className="w-1/5 p-3 text-center text-black">{row.date}</td>
            <td className="w-1/5 p-3 text-center text-black">{row.title}</td>
            <td className="w-1/5 p-3 text-center text-green-500">{row.status}</td>
            <td className="w-2/5 p-3 text-center">
              <div className="flex justify-center gap-4">
                <button 
                  className="bg-[#77DD77] text-white px-5 py-2 rounded-md hover:bg-[#66CC66] w-24"
                  onClick={() => handleView(row.id)}
                >
                  View
                </button>
                <button className="bg-[#FDFD96] text-black px-5 py-2 rounded-md hover:bg-[#FCF75E] w-24">
                  Update
                </button>
                <button className="bg-[#FF6961] text-white px-5 py-2 rounded-md hover:bg-[#E74C3C] w-24">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
