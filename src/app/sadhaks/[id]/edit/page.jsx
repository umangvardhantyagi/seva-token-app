"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import { getLocalSession } from "@/lib/authService";
import {
  getAccessAreas,
  getSadhakProfileById,
  getSevas,
  updateSadhak,
} from "@/lib/directoryService";
import {
  canManageSadhakProfile,
  getAllowedSevasForUser,
  isAdminUser,
} from "@/lib/permissionService";

export default function EditSadhakPage() {
  const router = useRouter();
  const params = useParams();
  const sadhakId = params?.id;
  const savingRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [canManage, setCanManage] = useState(false);

  const [sadhak, setSadhak] = useState(null);
  const [sevas, setSevas] = useState([]);
  const [accessAreas, setAccessAreas] = useState([]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [active, setActive] = useState(true);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [selectedSevaIds, setSelectedSevaIds] = useState([]);
  const [lockedSevaIds, setLockedSevaIds] = useState([]);
  const [selectedAccessAreaIds, setSelectedAccessAreaIds] = useState([]);

  const [sevaSearch, setSevaSearch] = useState("");
  const [accessSearch, setAccessSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState("");

  const [customAccessText, setCustomAccessText] = useState("");
  const [customAccessAreaNames, setCustomAccessAreaNames] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const filteredSevas = useMemo(() => {
    const text = sevaSearch.trim().toLowerCase();
    if (!text) return sevas;

    return sevas.filter((seva) => seva.nameLower.includes(text));
  }, [sevas, sevaSearch]);

  const filteredAccessAreas = useMemo(() => {
    const text = accessSearch.trim().toLowerCase();
    if (!text) return accessAreas;

    return accessAreas.filter((area) => area.nameLower.includes(text));
  }, [accessAreas, accessSearch]);

  const selectedSevas = useMemo(() => {
    return sevas.filter((seva) => selectedSevaIds.includes(seva.id));
  }, [sevas, selectedSevaIds]);

  const selectedAccessAreas = useMemo(() => {
    return accessAreas.filter((area) => selectedAccessAreaIds.includes(area.id));
  }, [accessAreas, selectedAccessAreaIds]);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);
    loadPage(session);
  }, [sadhakId]);

  async function loadPage(session) {
    if (!sadhakId) return;

    setLoading(true);

    try {
      const [profileData, sevaData, accessData] = await Promise.all([
        getSadhakProfileById(sadhakId),
        getSevas({ searchText: "" }),
        getAccessAreas({ searchText: "" }),
      ]);

      const allowed = await canManageSadhakProfile(session, profileData);
      setCanManage(allowed);

      const allowedSevas = await getAllowedSevasForUser(session, sevaData);

      const existingSevaIds = (profileData.sevas || []).map((item) => item.id);
      const allowedSevaIds = allowedSevas.map((item) => item.id);

      const editableSelectedSevaIds = existingSevaIds.filter((id) =>
        allowedSevaIds.includes(id)
      );

      const nonEditableSevaIds = existingSevaIds.filter(
        (id) => !allowedSevaIds.includes(id)
      );

      setSadhak(profileData);
      setSevas(isAdminUser(session) ? sevaData : allowedSevas);
      setAccessAreas(accessData);

      setName(profileData.name || "");
      setMobile(profileData.mobile || "");
      setAddress(profileData.address || "");
      setComment(profileData.notes || "");
      setActive(Boolean(profileData.active));
      setPhotoPreview(profileData.photoUrl || "");

      setSelectedSevaIds(
        isAdminUser(session) ? existingSevaIds : editableSelectedSevaIds
      );
      setLockedSevaIds(isAdminUser(session) ? [] : nonEditableSevaIds);

      setSelectedAccessAreaIds(
        (profileData.accessAreas || []).map((item) => item.id)
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleSeva(sevaId) {
    if (savingRef.current) return;

    setSelectedSevaIds((prev) => {
      if (prev.includes(sevaId)) {
        return prev.filter((id) => id !== sevaId);
      }

      return [...prev, sevaId];
    });
  }

  function toggleAccessArea(accessAreaId) {
    if (savingRef.current) return;

    setSelectedAccessAreaIds((prev) => {
      if (prev.includes(accessAreaId)) {
        return prev.filter((id) => id !== accessAreaId);
      }

      return [...prev, accessAreaId];
    });
  }

  function addCustomAccessArea() {
    if (savingRef.current) return;

    const cleanText = customAccessText.trim();

    if (!cleanText) {
      alert("Please write access area name");
      return;
    }

    const alreadyExists = customAccessAreaNames.some(
      (item) => item.toLowerCase() === cleanText.toLowerCase()
    );

    if (!alreadyExists) {
      setCustomAccessAreaNames((prev) => [...prev, cleanText]);
    }

    setCustomAccessText("");
  }

  function removeCustomAccessArea(name) {
    if (savingRef.current) return;

    setCustomAccessAreaNames((prev) => prev.filter((item) => item !== name));
  }

  function isValidMobile(value) {
    const clean = value.trim();

    if (clean === "00") return true;

    return /^[0-9]{10}$/.test(clean);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (savingRef.current) return;

    if (!canManage) {
      alert("You do not have permission to edit this sadhak");
      return;
    }

    if (!name.trim()) {
      alert("Please enter sadhak name");
      return;
    }

    if (!mobile.trim()) {
      alert("Please enter mobile number. Use 00 only if not available.");
      return;
    }

    if (!isValidMobile(mobile)) {
      alert("Mobile number must be 10 digits, or use 00 if not available.");
      return;
    }

    if (!address.trim()) {
      alert("Please enter address");
      return;
    }

    if (selectedSevaIds.length === 0) {
      alert("Please select at least one seva");
      return;
    }

    const finalSevaIds = [...new Set([...lockedSevaIds, ...selectedSevaIds])];

    savingRef.current = true;
    setSaving(true);

    try {
      await updateSadhak({
        sadhakId,
        name,
        mobile,
        address,
        comment,
        photoFile,
        sevaIds: finalSevaIds,
        accessAreaIds: selectedAccessAreaIds,
        customAccessAreaNames,
        active,
        updatedBy: currentUser,
      });

      alert("Sadhak updated successfully");
      router.replace(`/sadhaks/${sadhakId}`);
    } catch (error) {
      alert(error.message);
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Edit Sadhak" subtitle="Loading">
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
          Loading profile...
        </div>
      </AppShell>
    );
  }

  if (!sadhak) {
    return (
      <AppShell title="Edit Sadhak" subtitle="Not Found">
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-red-700">
          Sadhak profile not found.
        </div>
      </AppShell>
    );
  }

  if (!canManage) {
    return (
      <AppShell title="Edit Sadhak" subtitle="Restricted Access">
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-red-700">
          You can view this profile, but you do not have permission to edit it.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit Sadhak" subtitle={sadhak.sadhakCode}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]"
      >
        <div>
          <h2 className="text-2xl font-black text-[#172033]">
            Update Profile
          </h2>

          <p className="mt-1 text-xs font-bold text-[#697386]">
            {sadhak.sadhakCode}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Photo
          </label>

          <label className="block cursor-pointer rounded-[28px] border-2 border-dashed border-[#c9d5e8] bg-[#f8fafc] p-4 text-center transition hover:border-[#102a56] hover:bg-[#eef3fb]">
            {photoPreview ? (
              <div className="overflow-hidden rounded-[24px] bg-white">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-72 w-full object-cover"
                />

                <div className="p-3 text-sm font-black text-[#102a56]">
                  Tap to change photo
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#102a56] text-2xl font-black text-white">
                  +
                </div>

                <p className="mt-4 text-base font-black text-[#172033]">
                  Upload Sadhak Photo
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        <Input
          label="Name *"
          value={name}
          onChange={setName}
          disabled={saving}
        />

        <Input
          label="Mobile *"
          value={mobile}
          onChange={setMobile}
          placeholder="10 digit mobile or 00"
          disabled={saving}
        />

        <div>
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Address <span className="text-red-600">*</span>
          </label>

          <textarea
            value={address}
            disabled={saving}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Enter full address"
            className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56] disabled:opacity-60"
          />
        </div>

        <ProfessionalDropdown
          dropdownKey="seva"
          title="Seva *"
          placeholder="Select seva"
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          searchValue={sevaSearch}
          setSearchValue={setSevaSearch}
          searchPlaceholder="Search seva"
          items={filteredSevas}
          selectedItems={selectedSevas}
          selectedIds={selectedSevaIds}
          onToggle={toggleSeva}
          emptyText="No seva found"
          accentClass="bg-[#102a56] text-white"
          disabled={saving}
        />

        {lockedSevaIds.length > 0 && (
          <div className="rounded-2xl bg-yellow-50 p-4 text-xs font-bold leading-6 text-yellow-800">
            Some seva are assigned by admin and cannot be changed by this team
            leader.
          </div>
        )}

        <ProfessionalDropdown
          dropdownKey="access"
          title="Access Allowed Optional"
          placeholder="Select access area"
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          searchValue={accessSearch}
          setSearchValue={setAccessSearch}
          searchPlaceholder="Search access area"
          items={filteredAccessAreas}
          selectedItems={selectedAccessAreas}
          selectedIds={selectedAccessAreaIds}
          onToggle={toggleAccessArea}
          emptyText="No access area found"
          accentClass="bg-green-700 text-white"
          disabled={saving}
        />

        <div className="rounded-[26px] border border-[#d9e0ee] bg-[#f8fafc] p-4">
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Add Other Access Optional
          </label>

          <div className="flex gap-2">
            <input
              value={customAccessText}
              disabled={saving}
              onChange={(e) => setCustomAccessText(e.target.value)}
              placeholder="Example: Store Room"
              className="min-w-0 flex-1 rounded-2xl border border-[#d9e0ee] bg-white px-4 py-3 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56] disabled:opacity-60"
            />

            <button
              type="button"
              disabled={saving}
              onClick={addCustomAccessArea}
              className="rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              Add
            </button>
          </div>

          {customAccessAreaNames.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {customAccessAreaNames.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={saving}
                  onClick={() => removeCustomAccessArea(item)}
                  className="rounded-full bg-[#102a56] px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                >
                  {item} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Comment Optional
          </label>

          <textarea
            value={comment}
            disabled={saving}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Any important note"
            className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56] disabled:opacity-60"
          />
        </div>

        {isAdminUser(currentUser) && (
          <label className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm font-black text-[#172033]">
            <input
              type="checkbox"
              checked={active}
              disabled={saving}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active Profile
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => router.back()}
            className="rounded-2xl border border-[#d9e0ee] bg-[#eef3fb] px-4 py-4 text-sm font-black text-[#102a56] disabled:opacity-60"
          >
            Cancel
          </button>

          <LoadingButton
            type="submit"
            loading={saving}
            loadingText="Compressing & saving..."
          >
            Save
          </LoadingButton>
        </div>
      </form>
    </AppShell>
  );
}

function Input({ label, value, onChange, placeholder = "", disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#172033]">
        {label}
      </label>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56] disabled:opacity-60"
      />
    </div>
  );
}

function ProfessionalDropdown({
  dropdownKey,
  title,
  placeholder,
  openDropdown,
  setOpenDropdown,
  searchValue,
  setSearchValue,
  searchPlaceholder,
  items,
  selectedItems,
  selectedIds,
  onToggle,
  emptyText,
  accentClass,
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const isOpen = openDropdown === dropdownKey;

  useEffect(() => {
    function handleClickOutside(event) {
      if (!isOpen) return;

      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenDropdown("");
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        setOpenDropdown("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, setOpenDropdown]);

  function toggleDropdown() {
    if (disabled) return;
    setOpenDropdown(isOpen ? "" : dropdownKey);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-sm font-black text-[#172033]">
        {title}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`flex w-full touch-manipulation items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm font-black outline-none transition disabled:opacity-60 ${
          isOpen
            ? "border-[#102a56] bg-white shadow-[0_10px_26px_rgba(16,42,86,0.10)]"
            : "border-[#d9e0ee] bg-[#f8fafc]"
        }`}
      >
        <span
          className={
            selectedItems.length > 0 ? "text-[#172033]" : "text-[#697386]"
          }
        >
          {selectedItems.length > 0
            ? `${selectedItems.length} selected`
            : placeholder}
        </span>

        <span className="rounded-full bg-[#eef3fb] px-2 py-1 text-xs text-[#102a56]">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {selectedItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(item.id)}
              className={`touch-manipulation rounded-full px-4 py-2 text-xs font-black disabled:opacity-60 ${accentClass}`}
            >
              {item.name} ×
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-[24px] border border-[#d9e0ee] bg-white p-3 shadow-[0_24px_60px_rgba(16,42,86,0.18)]">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
            className="mb-3 w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-3 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
          />

          <div className="max-h-80 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="rounded-2xl bg-[#f8fafc] p-4 text-sm font-bold text-[#697386]">
                {emptyText}
              </p>
            ) : (
              items.map((item) => {
                const selected = selectedIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={`mb-2 flex w-full touch-manipulation items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition active:scale-[0.99] ${
                      selected
                        ? "bg-[#102a56] text-white"
                        : "bg-[#f8fafc] text-[#172033] hover:bg-[#eef3fb]"
                    }`}
                  >
                    <span className="pr-3 leading-5">{item.name}</span>

                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs text-[#102a56]">
                      {selected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpenDropdown("")}
            className="mt-3 w-full touch-manipulation rounded-2xl bg-[#eef3fb] px-4 py-3 text-sm font-black text-[#102a56]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}