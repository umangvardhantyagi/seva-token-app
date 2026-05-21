"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createInitialAdminIfNeeded,
  loginUser,
  checkUserExists,
} from "@/lib/authService";
import LoadingButton from "@/components/LoadingButton";

export default function LoginPage() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [setupPassword, setSetupPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [adminExists, setAdminExists] = useState(false);
  const [message, setMessage] = useState("");

  async function checkAdminStatus() {
    setCheckingAdmin(true);

    try {
      const exists = await checkUserExists("admin");
      setAdminExists(exists);
    } catch {
      setAdminExists(false);
    } finally {
      setCheckingAdmin(false);
    }
  }

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await loginUser({ loginId, password });
      router.replace("/");
    } catch (error) {
      setMessage(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAdmin() {
    if (!setupPassword.trim()) {
      setMessage("Enter admin password first");
      return;
    }

    setSetupLoading(true);
    setMessage("");

    try {
      await createInitialAdminIfNeeded(setupPassword.trim());
      setMessage("Admin account ready. Login ID is admin.");
      setLoginId("admin");
      setPassword("");
      setSetupPassword("");
      await checkAdminStatus();
    } catch (error) {
      setMessage(error.message || "Admin setup failed");
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5efe6] px-4 py-5 text-[#2f241d]">
      <div className="mx-auto max-w-md">
        <section className="overflow-hidden rounded-[34px] border border-[#eadfce] bg-[#fffaf3] shadow-[0_20px_55px_rgba(90,64,43,0.16)]">
          <div className="relative h-[335px] w-full overflow-hidden bg-[#eadfce]">
            <img
              src="/token.jpg"
              alt="Seva Token App"
              className="h-full w-full object-cover object-[center_34%]"
            />

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2f241d]/45 to-transparent" />
          </div>

          <div className="px-5 pt-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a88a6d]">
              Welcome
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#2f241d]">
              Seva Token App
            </h1>

            <p className="mt-2 text-sm font-semibold text-[#715b48]">
              Login with your assigned ID and password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 p-5 pt-6">
            <div>
              <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
                Login ID
              </label>
              <input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Example: admin"
                className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold outline-none transition focus:border-[#8a5d3c] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
                Password
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold outline-none transition focus:border-[#8a5d3c] focus:bg-white"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-700">
                {message}
              </div>
            )}

            <LoadingButton loading={loading} loadingText="Logging in...">
              Login
            </LoadingButton>

            <p className="text-center text-xs font-bold text-[#8a7461]">
              Forgot password? Please contact admin.
            </p>
          </form>
        </section>

        {!checkingAdmin && !adminExists && (
          <div className="mt-5 rounded-[30px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_35px_rgba(90,64,43,0.06)]">
            <h2 className="text-lg font-black">First Time Admin Setup</h2>

            <p className="mt-2 text-sm leading-6 text-[#715b48]">
              Use this only once to create the first admin account. Login ID
              will be admin.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
                Admin Password
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                placeholder="Create admin password"
                className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold outline-none transition focus:border-[#8a5d3c] focus:bg-white"
              />
            </div>

            <button
              onClick={handleCreateAdmin}
              disabled={setupLoading}
              className="mt-4 w-full rounded-2xl border border-[#d7c3ac] bg-[#f8f0e7] px-5 py-4 text-base font-black text-[#7b4f32]"
            >
              {setupLoading ? "Creating admin..." : "Create Admin Account"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}