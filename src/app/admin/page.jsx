"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import { cleanupOldData } from "@/lib/cleanupOldData";
import { resetTokenCounter } from "@/lib/tokenService";
import {
  createOrUpdateUser,
  deleteUser,
  getAccessMode,
  getLocalSession,
  getUsers,
  setAccessMode,
  toggleUserStatus,
} from "@/lib/authService";

export default function AdminPage() {
  const [session, setSession] = useState(null);

  const [loadingCleanup1Day, setLoadingCleanup1Day] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);

  const [message, setMessage] = useState("");
  const [accessMode, setAccessModeState] = useState("open");

  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState([]);

  const isAdmin = session?.loginId === "admin";

  async function loadAdminData() {
    try {
      const mode = await getAccessMode();
      const userList = await getUsers();

      setAccessModeState(mode);
      setUsers(userList);
    } catch (error) {
      setMessage(error.message || "Unable to load admin data");
    }
  }

  useEffect(() => {
    const localSession = getLocalSession();
    setSession(localSession);

    if (localSession?.loginId === "admin") {
      loadAdminData();
    }
  }, []);

  async function handleAccessModeChange(mode) {
    setLoadingMode(true);
    setMessage("");

    try {
      await setAccessMode(mode);
      setAccessModeState(mode);
      setMessage(
        `Access mode changed to ${
          mode === "open" ? "Open Link" : "Login Required"
        }.`
      );
    } catch (error) {
      setMessage(error.message || "Unable to change access mode");
    } finally {
      setLoadingMode(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();

    setLoadingUser(true);
    setMessage("");

    try {
      await createOrUpdateUser({
        name,
        loginId,
        password,
        active: true,
      });

      setName("");
      setLoginId("");
      setPassword("");
      setMessage("User account saved successfully.");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "Unable to save user");
    } finally {
      setLoadingUser(false);
    }
  }

  async function handleToggleUser(user) {
    setMessage("");

    try {
      await toggleUserStatus(user.loginId, !user.active);
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "Unable to update user");
    }
  }

  async function handleDeleteUser(user) {
    const confirmDelete = window.confirm(`Delete ${user.name}?`);

    if (!confirmDelete) return;

    setMessage("");

    try {
      await deleteUser(user.loginId);
      await loadAdminData();
      setMessage("User deleted successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to delete user");
    }
  }

  async function handleCleanupOneDay() {
    const confirmCleanup = window.confirm(
      "Delete records and photos older than 1 day?"
    );

    if (!confirmCleanup) return;

    setLoadingCleanup1Day(true);
    setMessage("");

    try {
      const deletedCount = await cleanupOldData(1);
      setMessage(
        `Cleanup completed. Deleted ${deletedCount} record(s) older than 1 day.`
      );
    } catch (error) {
      setMessage(error.message || "Cleanup failed");
    } finally {
      setLoadingCleanup1Day(false);
    }
  }

  async function handleResetCounter() {
    const confirmReset = window.confirm(
      "Are you sure? New token number will start again from 1."
    );

    if (!confirmReset) return;

    setLoadingReset(true);
    setMessage("");

    try {
      await resetTokenCounter();
      setMessage("Token counter reset successfully. Next token will be 1.");
    } catch (error) {
      setMessage(error.message || "Counter reset failed");
    } finally {
      setLoadingReset(false);
    }
  }

  if (!isAdmin) {
    return (
      <AppShell title="Admin" subtitle="Only admin can access this page.">
        <div className="rounded-[30px] border border-orange-100 bg-orange-50 p-5 text-sm font-bold text-orange-700">
          Admin access required. Please login with admin account.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Admin"
      subtitle="Manage users, access and cleanup settings."
    >
      <div className="space-y-5">
        <div className="rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
            Access Control
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#2f241d]">
            {accessMode === "open" ? "Open Link Access" : "Login Required"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#715b48]">
            Choose whether everyone with the link can use the app, or only
            created users can login.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loadingMode}
              onClick={() => handleAccessModeChange("open")}
              className={`rounded-2xl px-4 py-4 text-sm font-black ${
                accessMode === "open"
                  ? "bg-[#7b4f32] text-white shadow-[0_10px_24px_rgba(123,79,50,0.22)]"
                  : "bg-[#f8f0e7] text-[#7b4f32]"
              }`}
            >
              Open Link
            </button>

            <button
              type="button"
              disabled={loadingMode}
              onClick={() => handleAccessModeChange("login")}
              className={`rounded-2xl px-4 py-4 text-sm font-black ${
                accessMode === "login"
                  ? "bg-[#7b4f32] text-white shadow-[0_10px_24px_rgba(123,79,50,0.22)]"
                  : "bg-[#f8f0e7] text-[#7b4f32]"
              }`}
            >
              Login Required
            </button>
          </div>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="space-y-4 rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
              User Account
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#2f241d]">
              Create / Reset User
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#715b48]">
              Enter the same Login ID with a new password to reset password.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
              Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Mohan"
              className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold outline-none transition focus:border-[#8a5d3c] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
              Login ID
            </label>

            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="Example: mohan"
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
              placeholder="Example: 1234"
              className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold outline-none transition focus:border-[#8a5d3c] focus:bg-white"
            />
          </div>

          <LoadingButton loading={loadingUser} loadingText="Saving user...">
            Save User
          </LoadingButton>
        </form>

        <div className="rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
            Active Users
          </p>

          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <div
                key={user.loginId}
                className="rounded-2xl border border-[#eadfce] bg-[#f8f0e7] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-[#2f241d]">
                      {user.name}
                    </p>

                    <p className="text-sm font-bold text-[#7b4f32]">
                      {user.loginId}
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#8a7461]">
                      {user.active ? "Active" : "Disabled"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleToggleUser(user)}
                      className="block rounded-xl bg-white px-3 py-2 text-xs font-black text-[#7b4f32]"
                    >
                      {user.active ? "Disable" : "Enable"}
                    </button>

                    {user.loginId !== "admin" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        className="block rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="rounded-2xl bg-[#f8f0e7] p-4 text-sm font-bold text-[#715b48]">
                No users found.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
            Data Cleanup
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#2f241d]">
            Delete Old Records
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#715b48]">
            Use this when storage needs to be cleared early. Normal 3-day
            cleanup will be handled automatically later.
          </p>

          <div className="mt-4">
            <LoadingButton
              loading={loadingCleanup1Day}
              loadingText="Deleting old data..."
              onClick={handleCleanupOneDay}
              className="bg-[#8a5d3c]"
            >
              Delete Data Older Than 1 Day
            </LoadingButton>
          </div>
        </div>

        <div className="rounded-[32px] border border-red-100 bg-red-50 p-5 shadow-sm">
          <h2 className="text-xl font-black text-red-800">
            Reset Token Counter
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            Use this only when you want token numbers to start again from 1.
          </p>

          <div className="mt-4">
            <LoadingButton
              loading={loadingReset}
              loadingText="Resetting..."
              onClick={handleResetCounter}
              className="bg-red-700"
            >
              Reset Counter
            </LoadingButton>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
            {message}
          </div>
        )}
      </div>
    </AppShell>
  );
}