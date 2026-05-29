"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  createSeva,
  deleteSeva,
  getSevas,
  updateSeva,
} from "@/lib/directoryService";
import { getLocalSession } from "@/lib/authService";

export default function SevasPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sevas, setSevas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSeva, setEditingSeva] = useState(null);

  const [name, setName] = useState("");
  const [timing, setTiming] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.loginId === "admin";

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);
    loadSevas("");
  }, []);

  async function loadSevas(text = searchText) {
    setLoading(true);

    try {
      const data = await getSevas({ searchText: text });
      setSevas(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value) {
    setSearchText(value);
    loadSevas(value);
  }

  function openAddForm() {
    setEditingSeva(null);
    setName("");
    setTiming("");
    setDescription("");
    setActive(true);
    setShowForm(true);
  }

  function openEditForm(seva) {
    setEditingSeva(seva);
    setName(seva.name || "");
    setTiming(seva.timing || "");
    setDescription(seva.description || "");
    setActive(Boolean(seva.active));
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isAdmin) {
      alert("Only admin can manage seva");
      return;
    }

    if (!name.trim()) {
      alert("Please enter seva name");
      return;
    }

    setSaving(true);

    try {
      if (editingSeva) {
        await updateSeva({
          sevaId: editingSeva.id,
          name,
          timing,
          description,
          active,
        });
      } else {
        await createSeva({
          name,
          timing,
          description,
          createdBy: currentUser,
        });
      }

      setShowForm(false);
      setEditingSeva(null);
      setName("");
      setTiming("");
      setDescription("");
      setActive(true);

      await loadSevas(searchText);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(seva) {
    if (!isAdmin) {
      alert("Only admin can delete seva");
      return;
    }

    const ok = window.confirm(`Delete "${seva.name}"?`);

    if (!ok) return;

    try {
      await deleteSeva(seva.id);
      await loadSevas(searchText);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <AppShell title="Seva Groups" subtitle="Keli Kunj Seva">
      <div className="space-y-4">
        <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                Directory
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#172033]">
                Seva List
              </h2>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={openAddForm}
                className="rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white"
              >
                Add
              </button>
            )}
          </div>

          <input
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search seva"
            className="mt-4 w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
          />

          <p className="mt-3 text-xs font-bold text-[#697386]">
            Total seva: {sevas.length}
          </p>
        </section>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]"
          >
            <h3 className="text-xl font-black text-[#172033]">
              {editingSeva ? "Edit Seva" : "Add Seva"}
            </h3>

            <Input label="Seva Name" value={name} onChange={setName} />

            <Input
              label="Timing Optional"
              value={timing}
              onChange={setTiming}
              placeholder="Example: Morning / Evening / 24 hrs"
            />

            <div>
              <label className="mb-2 block text-sm font-black text-[#172033]">
                Description Optional
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
              />
            </div>

            {editingSeva && (
              <label className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm font-black text-[#172033]">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Active Seva
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-2xl border border-[#d9e0ee] bg-[#eef3fb] px-4 py-4 text-sm font-black text-[#102a56]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[#102a56] px-4 py-4 text-sm font-black text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

        <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-3 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
          {loading ? (
            <div className="p-5 text-sm font-black text-[#102a56]">
              Loading seva...
            </div>
          ) : sevas.length === 0 ? (
            <div className="p-5 text-sm font-black text-[#102a56]">
              No seva found.
            </div>
          ) : (
            <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1">
              {sevas.map((seva) => (
                <div
                  key={seva.id}
                  className="rounded-[24px] border border-[#d9e0ee] bg-[#f8fafc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black leading-6 text-[#172033]">
                        {seva.name}
                      </h3>

                      {seva.timing && (
                        <p className="mt-1 text-xs font-bold text-[#697386]">
                          {seva.timing}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-black ${
                        seva.active
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {seva.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {seva.description && (
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#697386]">
                      {seva.description}
                    </p>
                  )}

                  {isAdmin && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(seva)}
                        className="rounded-2xl border border-[#d9e0ee] bg-white px-4 py-3 text-sm font-black text-[#102a56]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(seva)}
                        className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Input({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#172033]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
      />
    </div>
  );
}