import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { base_url } from '../config';

interface SystemNotification {
  type: string;
  data: {
    status?: string;
    details?: string;
  };
  created_at: string;
}

const NotificationToast: React.FC = () => {
  const lastNotificationRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchLatestNotification = async () => {
      try {
        const response = await fetch(`${base_url}/get-system-logs/`);
        if (response.status === 204) return;

        if (!response.ok) return;

        const data: SystemNotification = await response.json();

        const identifier = `${data.type}-${data.created_at}`;
        if (identifier !== lastNotificationRef.current) {
          lastNotificationRef.current = identifier;

          console.log("testing Notification");
          

          const message = `${data.type.replace('_', ' ')} - ${data.data.status || ''} ${data.data.details || ''}`;

          toast(message);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('System Notification', { body: message });
          }
        }
      } catch (error) {
        console.error('Failed to fetch latest notification:', error);
      }
    };

    fetchLatestNotification();
    const intervalId = setInterval(fetchLatestNotification, 5000);
    

    return () => clearInterval(intervalId);
  }, []);

  return null;
};

export default NotificationToast;