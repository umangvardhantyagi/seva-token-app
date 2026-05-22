"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TokenCard from "@/components/TokenCard";
import { getLocalSession } from "@/lib/authService";
import {
  deleteSingleToken,
  getTodayTokens,
  updateTokenDetails,
} from "@/lib/tokenService";

export default function TodayPage() {
  const [session, setSession] = useState(null);
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
      setError(err.message || "Unable to load today tokens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSession(getLocalSession());
    loadTokens();
  }, []);

  async function handleEdit(token, updates) {
    const updatedToken = await updateTokenDetails({
      tokenId: token.id,
      ...updates,
    });

    setTokens((prev) =>
      prev.map((item) => (item.id === updatedToken.id ? updatedToken : item))
    );
  }

  async function handleDelete(token) {
    const confirmDelete = window.confirm(
      `Delete token ${token.tokenNo}? This cannot be undone.`
    );

    if (!confirmDelete) return;

    await deleteSingleToken(token);

    setTokens((prev) => prev.filter((item) => item.id !== token.id));
  }

  return (
    <AppShell title="Today’s Tokens" subtitle="All tokens created today.">
      <div className="mb-4 rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
              Total Today
            </p>

            <h2 className="mt-1 text-5xl font-black text-[#2f241d]">
              {tokens.length}
            </h2>
          </div>

          <button
            onClick={loadTokens}
            className="rounded-2xl bg-[#7b4f32] px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(123,79,50,0.22)]"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5 text-center text-sm font-black text-[#7b4f32]">
          Loading today’s tokens...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-700">
          {error}
        </div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <div className="rounded-[28px] border border-[#eadfce] bg-[#fffaf3] p-6 text-center shadow-sm">
          <p className="text-lg font-black text-[#2f241d]">No tokens yet</p>
          <p className="mt-2 text-sm font-semibold text-[#715b48]">
            Today’s generated tokens will appear here.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {tokens.map((token) => (
          <TokenCard
            key={token.id}
            token={token}
            currentUser={session}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </AppShell>
  );
}