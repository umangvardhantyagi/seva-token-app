"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TokenCard from "@/components/TokenCard";
import { getTodayTokens } from "@/lib/tokenService";

export default function TodayPage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTokens() {
    setLoading(true);
    setError("");

    try {
      const data = await getTodayTokens();
      setTokens(data);
    } catch (err) {
      setError(err.message || "Unable to load today's tokens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <AppShell
      title="Today’s Tokens"
      subtitle="View all seva tokens created today."
    >
      <div className="mb-4 rounded-[28px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_35px_rgba(90,64,43,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a88a6d]">
              Total Tokens
            </p>
            <h2 className="mt-1 text-4xl font-black text-[#2f241d]">
              {tokens.length}
            </h2>
          </div>

          <button
            onClick={loadTokens}
            className="rounded-2xl bg-[#7b4f32] px-5 py-3 text-sm font-black text-white shadow-md"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-4 text-center font-bold text-[#7b4f32]">
          Loading tokens...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-700">
          {error}
        </div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5 text-center text-sm font-bold text-[#715b48]">
          No tokens generated today.
        </div>
      )}

      <div className="space-y-4">
        {tokens.map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
    </AppShell>
  );
}