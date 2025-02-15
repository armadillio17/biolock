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
            } font-normal text-[10px]`}
            >
            <td className="p-3 text-center w-1/6">{row.date}</td>
            <td className="p-3 text-center w-1/6">{row.title}</td>
            <td className="p-3 text-center w-1/6">{row.status}</td>
            <td className="p-3 text-center w-1/6">
              <button 
                className="text-blue-500 hover:underline mr-2"
                onClick={() => handleView(row.id)}

                >View</button>
              <button className="text-green-500 hover:underline mr-2">Update</button>
              <button className="text-red-500 hover:underline">Delete</button>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
  );
};

