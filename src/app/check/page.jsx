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
        setError("No token found");
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Check Token"
      subtitle="Verify assigned person using token number, name or seva."
    >
      <form
        onSubmit={handleSearch}
        className="space-y-4 rounded-[30px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_35px_rgba(90,64,43,0.08)]"
      >
        <div>
          <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
            Token Number or Name
          </label>

          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Example: 1 or Ravi"
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