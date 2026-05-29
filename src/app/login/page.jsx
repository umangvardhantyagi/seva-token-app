"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/authService";
import LoadingButton from "@/components/LoadingButton";

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!loginId.trim()) {
      alert("Please enter login ID");
      return;
    }

    if (!password.trim()) {
      alert("Please enter password");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        loginId,
        password,
      });

      router.replace("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto min-h-screen max-w-md bg-white shadow-[0_24px_70px_rgba(16,42,86,0.16)]">
        <div className="relative h-[48vh] min-h-[360px] overflow-hidden">
          <img
            src="/token.jpg"
            alt="Keli Kunj"
            className="h-full w-full object-cover object-[center_30%]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/75">
              Keli Kunj
            </p>

            <h1 className="mt-2 text-4xl font-black leading-tight">
              Sadhak Directory
            </h1>
          </div>
        </div>

        <div className="rounded-t-[34px] bg-white px-5 pb-8 pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-black text-[#172033]">
                Login ID
              </label>

              <input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter login ID"
                className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-[#172033]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
              />
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Logging in..."
            >
              Login
            </LoadingButton>
          </form>
        </div>
      </div>
    </main>
  );
}