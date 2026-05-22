"use client";

import { useState } from "react";
import { sevaOptions } from "@/constants/sevaOptions";

export default function TokenCard({
  token,
  currentUser,
  onEdit,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(token.name || "");
  const [editSeva, setEditSeva] = useState(token.seva || "");
  const [editComment, setEditComment] = useState(token.comment || "");
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.loginId === "admin";
  const isOwner = currentUser?.loginId && currentUser.loginId === token.createdByLoginId;
  const canManage = Boolean(isAdmin || isOwner);

  const time = token.createdAt
    ? new Date(token.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  async function handleSave() {
    if (!onEdit) return;

    setSaving(true);

    try {
      await onEdit(token, {
        name: editName,
        seva: editSeva,
        comment: editComment,
      });

      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[30px] border border-[#eadfce] bg-[#fffaf3] shadow-[0_12px_35px_rgba(90,64,43,0.08)]">
      {token.photoUrl && (
        <img
          src={token.photoUrl}
          alt={token.name}
          loading="lazy"
          className="h-60 w-full object-cover"
        />
      )}

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a88a6d]">
              Token Number
            </p>

            <h2 className="mt-1 text-4xl font-black text-[#2f241d]">
              {token.tokenNo}
            </h2>
          </div>

          <span className="rounded-full border border-[#c8dfc7] bg-[#eef8ed] px-4 py-2 text-xs font-black text-[#3b7c3e]">
            Assigned
          </span>
        </div>

        {editing ? (
          <div className="space-y-3 rounded-2xl border border-[#eadfce] bg-[#f8f0e7] p-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#a88a6d]">
                Name
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-[#eadfce] bg-white px-3 py-3 text-sm font-bold outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#a88a6d]">
                Seva
              </label>
              <select
                value={editSeva}
                onChange={(e) => setEditSeva(e.target.value)}
                className="w-full rounded-xl border border-[#eadfce] bg-white px-3 py-3 text-sm font-bold outline-none"
              >
                {sevaOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-[#a88a6d]">
                Comment
              </label>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#eadfce] bg-white px-3 py-3 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-xl bg-[#7b4f32] px-3 py-3 text-sm font-black text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl bg-white px-3 py-3 text-sm font-black text-[#7b4f32]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-[#f8f0e7] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
                Name
              </p>
              <p className="mt-1 text-xl font-black text-[#2f241d]">
                {token.name}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f0e7] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
                Assigned Seva
              </p>
              <p className="mt-1 text-base font-black text-[#7b4f32]">
                {token.seva}
              </p>
            </div>

            {token.comment && (
              <div className="rounded-2xl bg-[#f8f0e7] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
                  Comment
                </p>
                <p className="mt-1 text-sm leading-6 text-[#715b48]">
                  {token.comment}
                </p>
              </div>
            )}
          </>
        )}

        <div className="rounded-2xl border border-[#eadfce] bg-white/60 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
            Created By
          </p>
          <p className="mt-1 text-sm font-black text-[#7b4f32]">
            {token.createdByName || token.createdByLoginId || "Not available"}
          </p>
        </div>

        {time && (
          <p className="pt-1 text-xs font-bold text-[#a88a6d]">
            Created at {time}
          </p>
        )}

        {canManage && !editing && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-xl border border-[#d7c3ac] bg-[#f8f0e7] px-3 py-3 text-sm font-black text-[#7b4f32]"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(token)}
              className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-black text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}