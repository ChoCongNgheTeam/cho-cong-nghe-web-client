"use client";

import { useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useAuth } from "@/hooks/useAuth";
import apiRequest from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const isFirebaseConfigReady = Object.values(firebaseConfig).every(Boolean);

export function useFcmToken() {
  const { isAuthenticated } = useAuth();
  const { refresh } = useNotifications();

  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (!isFirebaseConfigReady || !VAPID_KEY) return;

    const setup = async () => {
      try {
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const messaging = getMessaging(app);
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          await apiRequest.post("/notifications/fcm-token", { token, device: "web" });
        }

        onMessage(messaging, (payload) => {
          refreshRef.current(); // ← dùng ref
          if (payload.notification) {
            new Notification(payload.notification.title ?? "", {
              body: payload.notification.body,
              icon: "/icons/icon-192x192.png",
            });
          }
        });
      } catch (err) {
        console.error("[FCM] setup error:", err);
      }
    };

    setup();
  }, [isAuthenticated]);
}
