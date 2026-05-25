"use client";

import { useEffect, useState } from "react";
import { getLocalSession } from "@/lib/authService";
import {
  dismissNotification,
  getUnreadNotifications,
  respondToNotification,
} from "@/lib/messageService";

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.45
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.45);
  } catch (error) {
    console.log("Notification sound blocked by browser");
  }
}

export default function NotificationPopup() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  const currentNotification = notifications[0];

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);

    if (session?.loginId) {
      loadUnreadNotifications(session.loginId);
    }
  }, []);

  async function loadUnreadNotifications(loginId) {
    try {
      const data = await getUnreadNotifications(loginId);
      setNotifications(data);

      if (data.length > 0) {
        setTimeout(() => {
          playNotificationSound();
        }, 500);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  async function handleDismiss() {
    if (!currentNotification) return;

    try {
      await dismissNotification(currentNotification.id);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== currentNotification.id)
      );

      setResponseText("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleRespond() {
    if (!currentNotification) return;

    if (!responseText.trim()) {
      alert("Please write a response");
      return;
    }

    setResponding(true);

    try {
      await respondToNotification({
        notificationId: currentNotification.id,
        responseMessage: responseText,
      });

      setNotifications((prev) =>
        prev.filter((item) => item.id !== currentNotification.id)
      );

      setResponseText("");
    } catch (error) {
      alert(error.message);
    } finally {
      setResponding(false);
    }
  }

  if (!currentUser || !currentNotification) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto max-w-md px-4">
      <div className="rounded-[30px] border border-[#e6d5c3] bg-[#fffaf3] p-4 shadow-[0_22px_60px_rgba(47,36,29,0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a88a6d]">
              New Token Alert
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#2f241d]">
              Token No. {currentNotification.tokenNo}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full bg-[#f8f0e7] px-3 py-2 text-sm font-black text-[#7b4f32]"
          >
            ×
          </button>
        </div>

        {currentNotification.tokenPhotoUrl && (
          <img
            src={currentNotification.tokenPhotoUrl}
            alt={currentNotification.tokenName || "Token"}
            className="mt-4 h-44 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-4 space-y-3">
          <Info label="Name" value={currentNotification.tokenName} />
          <Info label="Seva" value={currentNotification.tokenSeva} />
          <Info
            label="Message"
            value={
              currentNotification.message || currentNotification.tokenComment
            }
          />
          <Info
            label="Tagged By"
            value={
              currentNotification.taggedByName ||
              currentNotification.taggedByLoginId
            }
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
            Your Response
          </label>

          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={3}
            placeholder="Example: Sending now"
            className="w-full rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] px-4 py-3 text-sm font-semibold text-[#2f241d] outline-none placeholder:text-[#a88a6d]"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-2xl border border-[#d7c3ac] bg-[#f8f0e7] px-4 py-4 text-sm font-black text-[#7b4f32]"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={handleRespond}
            disabled={responding}
            className="rounded-2xl bg-[#7b4f32] px-4 py-4 text-sm font-black text-white disabled:opacity-60"
          >
            {responding ? "Saving..." : "Respond"}
          </button>
        </div>

        {notifications.length > 1 && (
          <p className="mt-3 text-center text-xs font-bold text-[#8d735f]">
            {notifications.length - 1} more alert pending
          </p>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f8f0e7] p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a88a6d]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#2f241d]">
        {value || "Not available"}
      </p>
    </div>
  );
}