"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getLocalSession } from "@/lib/authService";
import {
  dismissNotification,
  getMyNotifications,
  respondToNotification,
} from "@/lib/messageService";

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [responseMap, setResponseMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);

    if (session?.loginId) {
      loadNotifications(session.loginId);
    }
  }, []);

  async function loadNotifications(loginId) {
    setLoading(true);

    try {
      const data = await getMyNotifications(loginId);
      setNotifications(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateResponse(notificationId, value) {
    setResponseMap((prev) => ({
      ...prev,
      [notificationId]: value,
    }));
  }

  async function handleDismiss(notificationId) {
    const ok = window.confirm("Dismiss this notification?");

    if (!ok) return;

    try {
      await dismissNotification(notificationId);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notificationId)
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleRespond(notificationId) {
    const responseMessage = responseMap[notificationId] || "";

    if (!responseMessage.trim()) {
      alert("Please write a response");
      return;
    }

    try {
      await respondToNotification({
        notificationId,
        responseMessage,
      });

      await loadNotifications(currentUser.loginId);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <AppShell title="Alerts" subtitle="Tokens tagged to you.">
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-[28px] border border-[#e6d5c3] bg-[#fffaf3] p-5 text-sm font-black text-[#7b4f32]">
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[28px] border border-[#e6d5c3] bg-[#fffaf3] p-5 text-sm font-black text-[#7b4f32]">
            No alerts found.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[32px] border border-[#e6d5c3] bg-[#fffaf3] shadow-[0_16px_42px_rgba(77,50,31,0.10)]"
            >
              {item.tokenPhotoUrl && (
                <img
                  src={item.tokenPhotoUrl}
                  alt={item.tokenName || "Token"}
                  className="h-52 w-full object-cover"
                />
              )}

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a88a6d]">
                      Token Alert
                    </p>

                    <h2 className="mt-1 text-4xl font-black text-[#2f241d]">
                      #{item.tokenNo}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                      item.isRead
                        ? "bg-[#eef8ed] text-[#3b7c3e]"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.isRead ? "Responded" : "New"}
                  </span>
                </div>

                <Info label="Name" value={item.tokenName} />
                <Info label="Seva" value={item.tokenSeva} />
                <Info label="Message" value={item.message || item.tokenComment} />
                <Info label="Tagged By" value={item.taggedByName} />

                {item.responseMessage ? (
                  <Info label="Your Response" value={item.responseMessage} />
                ) : (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
                        Respond
                      </label>

                      <textarea
                        value={responseMap[item.id] || ""}
                        onChange={(e) =>
                          updateResponse(item.id, e.target.value)
                        }
                        rows={3}
                        placeholder="Example: Okay, sending now"
                        className="w-full rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] px-4 py-3 text-sm font-semibold text-[#2f241d] outline-none placeholder:text-[#a88a6d]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleDismiss(item.id)}
                        className="rounded-2xl border border-[#d7c3ac] bg-[#f8f0e7] px-4 py-4 text-sm font-black text-[#7b4f32]"
                      >
                        Dismiss
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRespond(item.id)}
                        className="rounded-2xl bg-[#7b4f32] px-4 py-4 text-sm font-black text-white"
                      >
                        Respond
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f8f0e7] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a88a6d]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black leading-6 text-[#2f241d]">
        {value || "Not available"}
      </p>
    </div>
  );
}