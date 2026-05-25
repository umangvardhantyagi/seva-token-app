"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import PhotoUpload from "@/components/PhotoUpload";
import TokenCard from "@/components/TokenCard";
import { sevaOptions } from "@/constants/sevaOptions";
import { getLocalSession } from "@/lib/authService";
import { createTokenFast, uploadPhotoForToken } from "@/lib/tokenService";
import { addTokenMessage, getActiveUsers } from "@/lib/messageService";

export default function AssignPage() {
  const [currentUser, setCurrentUser] = useState(null);

  const [name, setName] = useState("");
  const [seva, setSeva] = useState("");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [createdToken, setCreatedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const filteredUsers = useMemo(() => {
    const text = userSearch.trim().toLowerCase();

    const availableUsers = users.filter(
      (user) => user.loginId !== currentUser?.loginId
    );

    if (!text) {
      return availableUsers.slice(0, 10);
    }

    return availableUsers
      .filter((user) => {
        const userName = user.name?.toLowerCase() || "";
        const loginId = user.loginId?.toLowerCase() || "";

        return userName.includes(text) || loginId.includes(text);
      })
      .slice(0, 20);
  }, [users, userSearch, currentUser]);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);

    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const activeUsers = await getActiveUsers();
      setUsers(activeUsers);
    } catch (error) {
      console.error(error.message);
    }
  }

  function toggleTaggedUser(user) {
    setSelectedUsers((prev) => {
      const exists = prev.some((item) => item.loginId === user.loginId);

      if (exists) {
        return prev.filter((item) => item.loginId !== user.loginId);
      }

      return [...prev, user];
    });
  }

  function removeSelectedUser(loginId) {
    setSelectedUsers((prev) =>
      prev.filter((user) => user.loginId !== loginId)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter name");
      return;
    }

    if (!seva) {
      alert("Please select seva");
      return;
    }

    setLoading(true);
    setCreatedToken(null);

    try {
      const token = await createTokenFast({
        name,
        seva,
        comment,
        createdBy: currentUser,
      });

      setCreatedToken(token);

      if (selectedUsers.length > 0) {
        await addTokenMessage({
          tokenId: token.id,
          message: comment?.trim() || "Token assigned to you.",
          taggedUsers: selectedUsers,
          createdBy: currentUser,
        });
      }

      if (photoFile) {
        setPhotoUploading(true);

        uploadPhotoForToken({
          tokenId: token.id,
          tokenNo: token.tokenNo,
          photoFile,
        })
          .then((updatedToken) => {
            if (updatedToken) {
              setCreatedToken(updatedToken);
            }
          })
          .finally(() => {
            setPhotoUploading(false);
          });
      }

      setName("");
      setSeva("");
      setComment("");
      setPhotoFile(null);
      setUserSearch("");
      setSelectedUsers([]);
      setResetKey((prev) => prev + 1);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Assign Token"
      subtitle="Create token, add comment and tag user if needed."
    >
      <div className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[32px] border border-[#e6d5c3] bg-[#fffaf3] p-5 shadow-[0_16px_42px_rgba(77,50,31,0.10)]"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a88a6d]">
              New Token
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#2f241d]">
              Enter Seva Details
            </h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
              Person Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="w-full rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] px-4 py-4 text-base font-bold text-[#2f241d] outline-none placeholder:text-[#a88a6d]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
              Select Seva
            </label>

            <select
              value={seva}
              onChange={(e) => setSeva(e.target.value)}
              className="w-full rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] px-4 py-4 text-base font-bold text-[#2f241d] outline-none"
            >
              <option value="">Select seva</option>

              {sevaOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
              Comment / Message Optional
            </label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Example: Wants to go to Seva Bhawan"
              className="w-full rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] px-4 py-4 text-base font-semibold text-[#2f241d] outline-none placeholder:text-[#a88a6d]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
              Tag User Optional
            </label>

            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name"
              className="w-full rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] px-4 py-4 text-base font-bold text-[#2f241d] outline-none placeholder:text-[#a88a6d]"
            />

            {selectedUsers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-[#e4d1bd] bg-[#fffaf3] p-3">
                {selectedUsers.map((user) => (
                  <button
                    key={user.loginId}
                    type="button"
                    onClick={() => removeSelectedUser(user.loginId)}
                    className="rounded-full bg-[#7b4f32] px-4 py-2 text-xs font-black text-white"
                  >
                    {user.name} ×
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 max-h-56 overflow-y-auto rounded-2xl border border-[#e4d1bd] bg-[#f8f0e7] p-2">
              {filteredUsers.length === 0 ? (
                <p className="p-3 text-sm font-bold text-[#715b48]">
                  No user found
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const selected = selectedUsers.some(
                    (item) => item.loginId === user.loginId
                  );

                  return (
                    <button
                      key={user.loginId}
                      type="button"
                      onClick={() => toggleTaggedUser(user)}
                      className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition active:scale-[0.99] ${
                        selected
                          ? "bg-[#7b4f32] text-white"
                          : "bg-white text-[#2f241d]"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-black">
                          {user.name}
                        </span>

                        <span
                          className={`block text-xs font-bold ${
                            selected ? "text-white/70" : "text-[#8d735f]"
                          }`}
                        >
                          {user.loginId}
                        </span>
                      </span>

                      <span className="text-xs font-black">
                        {selected ? "Selected" : "Tag"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <p className="mt-2 text-xs font-bold text-[#8d735f]">
              Tagging is optional. Only tagged users will receive alerts.
            </p>
          </div>

          <PhotoUpload onChange={setPhotoFile} resetKey={resetKey} />

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Creating token..."
          >
            Generate Token
          </LoadingButton>
        </form>

        {photoUploading && (
          <div className="rounded-2xl border border-[#d7c3ac] bg-[#fffaf3] p-4 text-sm font-black text-[#7b4f32] shadow-sm">
            Photo is uploading in background...
          </div>
        )}

        {createdToken && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#c8dfc7] bg-[#eef8ed] p-4 text-sm font-black text-[#3b7c3e]">
              Token created successfully
            </div>

            <TokenCard token={createdToken} currentUser={currentUser} />
          </div>
        )}
      </div>
    </AppShell>
  );
}