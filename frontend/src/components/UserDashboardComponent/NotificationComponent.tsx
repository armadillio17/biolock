"use client";

import { notif } from '@/data/ts/dummyData';
import { icons } from '@/constants/icons'

export const Notification = () => {
  return (
  <div>
    {notif.map((item) => (
        <div key={item.id} className="flex w-full p-3 mb-3 bg-white rounded-2xl shadow ">
        <div className="flex items-center gap-2 ">
            <img 
            src={icons[item.status]}
            alt={item.status}
            className="w-5 h-5 text-gray-500 mr-2"
            /> {/* Icon for each notification */}
            <p className="text-[16px] font-normal">{item.message}</p>
        </div>
        </div>
    ))}
  </div>
  );
};
