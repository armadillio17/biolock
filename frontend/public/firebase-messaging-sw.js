/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// The Firebase config is read from this worker's own registration URL query
// string. Unlike an in-memory value set via postMessage, the script URL is
// persisted by the browser and replayed on every SW restart — including when
// a background push wakes the worker — so Firebase can always re-initialize.
let firebaseConfig = null;
try {
  const raw = new URL(self.location).searchParams.get("config");
  if (raw) firebaseConfig = JSON.parse(raw);
} catch (e) {
  console.error("[firebase-messaging-sw.js] Failed to parse config:", e);
}

initializeFirebase();

function initializeFirebase() {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.warn("[firebase-messaging-sw.js] No Firebase config in SW URL");
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message:", payload);

    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
      body: payload.notification?.body || "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click:", event);
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
