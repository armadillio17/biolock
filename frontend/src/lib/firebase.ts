import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

// Only initialize messaging in browser environments that support it
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn("Firebase Messaging is not supported in this browser");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

export const onMessageListener = (): Promise<unknown> => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.warn("Firebase Messaging is not supported in this browser");
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export { messaging };
