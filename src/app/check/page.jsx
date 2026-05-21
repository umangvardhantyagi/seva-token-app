"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import SevaSelector from "@/components/SevaSelector";
import TokenCard from "@/components/TokenCard";
import { searchTokens } from "@/lib/tokenService";

export default function CheckPage() {
  const [searchText, setSearchText] = useState("");
  const [seva, setSeva] = useState("");
  const [tokens, setTokens] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setTokens([]);

    try {
      const results = await searchTokens({
        searchText,
        seva,
      });

      setTokens(results);

      if (results.length === 0) {
        setError("No token found. Please check token number or name.");
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Check Token" subtitle="Verify assigned seva person quickly.">
      <form
        onSubmit={handleSearch}
        className="space-y-5 rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
            Token Search
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#2f241d]">
            Find assigned person
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#715b48]">
            Enter token number or name. Seva filter is optional.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
            Token Number or Name
          </label>

          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Example: 1 or Mohan"
            className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold text-[#2f241d] shadow-sm outline-none transition focus:border-[#8a5d3c] focus:bg-white"
          />
        </div>

        <SevaSelector value={seva} onChange={setSeva} />

        <LoadingButton loading={loading} loadingText="Searching...">
          Search Token
        </LoadingButton>
      </form>

      {error && (
        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-700">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {tokens.map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
    </AppShell>
  );
}