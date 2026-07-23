import { useEffect, useState, useCallback } from "react";
import { requestNotificationPermission, onMessageListener } from "../lib/firebase";
import { authAxios } from "../lib/secured-axios-instance";
import toast from "react-hot-toast";

interface FCMPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export const useFCM = (userId: number | null) => {
  const [token, setToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Service Worker registered:", registration);

        // Pass Firebase config to service worker
        if (registration.active) {
          registration.active.postMessage({
            type: "FIREBASE_CONFIG",
            config: {
              apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
              authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
              projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
              storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
              appId: import.meta.env.VITE_FIREBASE_APP_ID,
            },
          });
        }

        return registration;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return null;
      }
    }
    return null;
  }, []);

  const requestPermission = useCallback(async () => {
    await registerServiceWorker();
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setIsPermissionGranted(true);

      // Send token to backend if user is logged in
      if (userId) {
        try {
          await authAxios.post("/device-tokens/", {
            user_id: userId,
            token: fcmToken,
            device_type: "web",
          });
          console.log("FCM token registered with backend");
        } catch (error) {
          console.error("Failed to register FCM token:", error);
        }
      }
    }
    return fcmToken;
  }, [userId, registerServiceWorker]);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribe = onMessageListener()
      .then((payload) => {
        const message = payload as FCMPayload;
        if (message.notification) {
          toast(message.notification.body || "New notification", {
            icon: "🔔",
          });
        }
      })
      .catch((err) => console.error("Message listener error:", err));

    return () => {
      // Cleanup if needed
      void unsubscribe;
    };
  }, []);

  return {
    token,
    isPermissionGranted,
    requestPermission,
  };
};
