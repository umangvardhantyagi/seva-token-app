"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import PhotoUpload from "@/components/PhotoUpload";
import SevaSelector from "@/components/SevaSelector";
import TokenCard from "@/components/TokenCard";
import { getLocalSession } from "@/lib/authService";
import { createTokenFast, uploadPhotoForToken } from "@/lib/tokenService";

export default function AssignPage() {
  const [session, setSession] = useState(null);

  const [name, setName] = useState("");
  const [seva, setSeva] = useState("");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setSession(getLocalSession());
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setGeneratedToken(null);

    if (!seva) {
      setError("Please select seva");
      return;
    }

    if (!name.trim()) {
      setError("Please enter person name");
      return;
    }

    if (!photoFile) {
      setError("Please take or choose photo");
      return;
    }

    setLoading(true);

    try {
      const savedPhotoFile = photoFile;

      const token = await createTokenFast({
        name,
        seva,
        comment,
        createdBy: {
          loginId: session?.loginId || "",
          name: session?.name || "",
        },
      });

      setGeneratedToken(token);

      setName("");
      setSeva("");
      setComment("");
      setPhotoFile(null);
      setResetKey((prev) => prev + 1);
      setLoading(false);

      setTimeout(async () => {
        const updatedToken = await uploadPhotoForToken({
          tokenId: token.id,
          tokenNo: token.tokenNo,
          photoFile: savedPhotoFile,
        });

        if (updatedToken) {
          setGeneratedToken(updatedToken);
        }
      }, 100);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <AppShell title="Assign Token">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
            New Token
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#2f241d]">
            Enter seva details
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#715b48]">
            Fill details and generate token number instantly.
          </p>
        </div>

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
          <div className="rounded-[30px] border border-green-100 bg-green-50 p-6 text-center text-green-800 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em]">
              Token Generated
            </p>

            <h2 className="mt-2 text-6xl font-black leading-none">
              {generatedToken.tokenNo}
            </h2>

            <p className="mt-3 text-sm font-bold">
              Please note this token number.
            </p>
          </div>

          <TokenCard token={generatedToken} currentUser={session} />
        </div>
      )}
    </AppShell>
  );
}