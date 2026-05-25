"use client";

import { useEffect, useState } from "react";
import { getTokenResponses } from "@/lib/messageService";

export default function TokenResponses({ token }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResponses();
  }, [token?.id]);

  async function loadResponses() {
    if (!token?.id) return;

    setLoading(true);

    try {
      const data = await getTokenResponses(token.id);
      setResponses(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#f8f0e7] p-4 text-sm font-bold text-[#715b48]">
        Loading responses...
      </div>
    );
  }

  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-[#f8f0e7] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a88a6d]">
        Responses
      </p>

      <div className="mt-3 space-y-3">
        {responses.map((item) => {
          const time = item.respondedAt
            ? new Date(item.respondedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#2f241d]">
                    {item.taggedUserName || item.taggedUserLoginId}
                  </p>

                  {time && (
                    <p className="mt-1 text-xs font-bold text-[#a88a6d]">
                      Responded at {time}
                    </p>
                  )}
                </div>

                <span className="rounded-full bg-[#eef8ed] px-3 py-2 text-[11px] font-black text-[#3b7c3e]">
                  Response
                </span>
              </div>

              {item.originalMessage && (
                <div className="mt-3 rounded-xl bg-[#f8f0e7] p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a88a6d]">
                    Original Message
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-6 text-[#715b48]">
                    {item.originalMessage}
                  </p>
                </div>
              )}

              <p className="mt-3 text-sm font-black leading-6 text-[#2f241d]">
                {item.responseMessage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}