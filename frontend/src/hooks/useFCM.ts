import { useEffect, useState, useCallback } from "react";
import { requestNotificationPermission, onForegroundMessage } from "../lib/firebase";
import { authAxios } from "../lib/secured-axios-instance";
import toast from "react-hot-toast";

export const useFCM = (userId: number | null) => {
  const [token, setToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        // Pass the Firebase config in the SW registration URL rather than via
        // postMessage. A service worker is ephemeral — its in-memory state is
        // wiped on every restart (including when a background push wakes it),
        // so a posted config never survives. The query string is part of the
        // script URL, which the browser persists and replays on every restart,
        // so the SW can always re-initialize Firebase.
        const config = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        };
        const swUrl = `/firebase-messaging-sw.js?config=${encodeURIComponent(
          JSON.stringify(config)
        )}`;
        const registration = await navigator.serviceWorker.register(swUrl);
        await navigator.serviceWorker.ready;
        console.log("Service Worker registered:", registration);
        return registration;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return null;
      }
    }
    return null;
  }, []);

  const requestPermission = useCallback(async () => {
    const registration = await registerServiceWorker();
    const fcmToken = await requestNotificationPermission(registration ?? undefined);
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

  // Register the service worker and FCM token once we know who the user is.
  useEffect(() => {
    if (userId) {
      requestPermission();
    }
  }, [userId, requestPermission]);

  // Listen for foreground messages (keeps firing for every message).
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const body = payload.notification?.body ?? payload.data?.body;
      toast(body || "New notification", { icon: "🔔" });
    });

    return () => unsubscribe();
  }, []);

  return {
    token,
    isPermissionGranted,
    requestPermission,
  };
};
