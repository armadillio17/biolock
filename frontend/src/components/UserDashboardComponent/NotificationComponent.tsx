"use client";
import { useEffect } from 'react';
import { icons } from '@/constants/icons'
import { useNotificationStore } from "@/store/notificationStore"

export const Notification = () => {

  const { notification, fetchNotificationList } = useNotificationStore();

  useEffect(() => {
    if (notification.length === 0) {
      fetchNotificationList();
    }
  }, [notification, fetchNotificationList]);

  return (
    <div>
      {notification && notification.length > 0 ? (
        notification.map((item) => (
          <div key={item.id} className="flex w-full p-3 mb-3 bg-white rounded-2xl shadow">
            <div className="flex items-center gap-2">
              <img
                src={icons[item.type] || icons['default']} // Use the type or a default icon if type doesn't match
                alt={item.type}
                className="w-5 h-5 text-gray-500 mr-2"
              />
              <p className="text-[16px] font-normal">{item.data}</p> {/* Notification message */}
              <span className="text-gray-500 text-xs ml-2">
                {/* Check if created_at is not null before converting */}
                {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown time"}
              </span> {/* Created timestamp */}
            </div>
          </div>
        ))
      ) : (
        <div>No notifications available.</div>
      )}
    </div>
  );
};
