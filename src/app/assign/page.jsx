"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import PhotoUpload from "@/components/PhotoUpload";
import SevaSelector from "@/components/SevaSelector";
import TokenCard from "@/components/TokenCard";
import { createToken } from "@/lib/tokenService";

export default function AssignPage() {
  const [name, setName] = useState("");
  const [seva, setSeva] = useState("");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setGeneratedToken(null);
    setProgress("");

    if (!seva) {
      setError("Please select seva");
      return;
    }

    if (!name.trim()) {
      setError("Please enter person name");
      return;
    }

    if (!photoFile) {
      setError("Please take or upload photo");
      return;
    }

    setLoading(true);

    try {
      setProgress("Compressing photo and creating token...");

      const result = await createToken({
        name,
        seva,
        comment,
        photoFile,
      });

      setGeneratedToken(result);
      setProgress(`Token ${result.tokenNo} generated successfully`);

      setName("");
      setSeva("");
      setComment("");
      setPhotoFile(null);
      setResetKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setProgress("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Assign Token"
      subtitle="Create a new seva token with name, photo and seva details."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[30px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_35px_rgba(90,64,43,0.08)]"
      >
        <SevaSelector value={seva} onChange={setSeva} />

        <div>
          <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
            Person Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter person name"
            className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold text-[#2f241d] shadow-sm outline-none transition focus:border-[#8a5d3c] focus:bg-white"
          />
        </div>

        <PhotoUpload onChange={setPhotoFile} resetKey={resetKey} />

        <div>
          <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
            Comment Optional
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a short note if needed"
            rows={3}
            className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base text-[#2f241d] shadow-sm outline-none transition focus:border-[#8a5d3c] focus:bg-white"
          />
        </div>

        {progress && (
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-black text-green-700">
            {progress}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <LoadingButton loading={loading} loadingText="Generating token...">
          Generate Token
        </LoadingButton>
      </form>

      {generatedToken && (
        <div className="mt-5 space-y-3">
          <div className="rounded-[28px] border border-green-100 bg-green-50 p-5 text-center text-green-800">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              Token Generated
            </p>

            <h2 className="mt-2 text-5xl font-black">
              {generatedToken.tokenNo}
            </h2>

            <p className="mt-2 text-sm font-bold">
              Please note this token number.
            </p>
          </div>

          <TokenCard token={generatedToken} />
        </div>
      )}
    </AppShell>
  );
}