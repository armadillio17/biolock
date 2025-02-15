"use client";
import { imgData } from "@/data/ts/dummyData";
import { useParams } from "react-router-dom";

export const ViewEventComponent = () => {
  const { id } = useParams(); // Get the dynamic ID from the URL
  const eventId = Number(id); // Convert to number

  // const event = imgData[eventId]; // Get the event data
  const event = imgData.find((event) => event.id === eventId);

  // Validate eventId
  if (!event) {
    return <p className="text-red-500">Not found.</p>; // Handle case where ID does not exist
  }

  return (
    <div className="flex flex-col">
      {/* Image Section */}
      <div className="w-full h-[50vh] mt-5">
        <img
          src={event.src}
          alt={`Event ${event.id}`}
          className="w-full h-full object-contain rounded-[10px]"
        />
      </div>

      {/* Content Section */}
      <div className="w-full p-2">
        <h1 className="text-[18px] font-bold">{event.title}</h1>
        <h2 className="my-1 text-[12px] font-normal">{event.date}</h2>
        <p className="w-full max-h-[247px] my-5 text-[16px] font-normal">
          {event.description}
        </p>
      </div>
    </div>
  );
};
