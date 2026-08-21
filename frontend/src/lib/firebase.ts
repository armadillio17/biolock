import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from "firebase/messaging";

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

export const requestNotificationPermission = async (
  serviceWorkerRegistration?: ServiceWorkerRegistration
): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn("Firebase Messaging is not supported in this browser");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        // Reuse the SW we registered (with config in its URL) so getToken
        // doesn't register its own config-less /firebase-messaging-sw.js.
        serviceWorkerRegistration,
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

// Registers a foreground-message handler and returns an unsubscribe function.
// Unlike a one-shot Promise, this keeps firing for every message received.
export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void
): (() => void) => {
  if (!messaging) {
    console.warn("Firebase Messaging is not supported in this browser");
    return () => {};
  }
  return onMessage(messaging, callback);
};

export { messaging };
