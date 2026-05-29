"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import LoadingButton from "@/components/LoadingButton";
import { getLocalSession } from "@/lib/authService";
import {
  createSadhak,
  getAccessAreas,
  getSevas,
} from "@/lib/directoryService";
import {
  canAddSadhak,
  getAllowedSevasForUser,
} from "@/lib/permissionService";

export default function NewSadhakPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [sevas, setSevas] = useState([]);
  const [accessAreas, setAccessAreas] = useState([]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [selectedSevaIds, setSelectedSevaIds] = useState([]);
  const [selectedAccessAreaIds, setSelectedAccessAreaIds] = useState([]);

  const [sevaSearch, setSevaSearch] = useState("");
  const [accessSearch, setAccessSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState("");

  const [customAccessText, setCustomAccessText] = useState("");
  const [customAccessAreaNames, setCustomAccessAreaNames] = useState([]);

  const [saving, setSaving] = useState(false);

  const allowedToAdd = canAddSadhak(currentUser);

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
    loadOptions(session);
  }, []);

  async function loadOptions(session) {
    try {
      const [sevaData, accessData] = await Promise.all([
        getSevas({ searchText: "" }),
        getAccessAreas({ searchText: "" }),
      ]);

      const allowedSevas = await getAllowedSevasForUser(session, sevaData);

      setSevas(allowedSevas);
      setAccessAreas(accessData);
    } catch (error) {
      alert(error.message);
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleSeva(sevaId) {
    setSelectedSevaIds((prev) => {
      if (prev.includes(sevaId)) {
        return prev.filter((id) => id !== sevaId);
      }

      return [...prev, sevaId];
    });
  }

  function toggleAccessArea(accessAreaId) {
    setSelectedAccessAreaIds((prev) => {
      if (prev.includes(accessAreaId)) {
        return prev.filter((id) => id !== accessAreaId);
      }

      return [...prev, accessAreaId];
    });
  }

  function addCustomAccessArea() {
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
    setCustomAccessAreaNames((prev) => prev.filter((item) => item !== name));
  }

  function isValidMobile(value) {
    const clean = value.trim();

    if (clean === "00") return true;

    return /^[0-9]{10}$/.test(clean);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!allowedToAdd) {
      alert("You do not have permission to add sadhak");
      return;
    }

    if (!photoFile) {
      alert("Please upload sadhak photo");
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

    setSaving(true);

    try {
      await createSadhak({
        name,
        mobile,
        address,
        comment,
        photoFile,
        sevaIds: selectedSevaIds,
        accessAreaIds: selectedAccessAreaIds,
        customAccessAreaNames,
        createdBy: currentUser,
      });

      alert("Sadhak added successfully");
      router.replace("/sadhaks");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!allowedToAdd) {
    return (
      <AppShell title="Add Sadhak" subtitle="Restricted Access">
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-red-700">
          You do not have permission to add sadhak.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Add Sadhak" subtitle="New Profile">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]"
      >
        <h2 className="text-2xl font-black text-[#172033]">
          Sadhak Details
        </h2>

        <div>
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Photo <span className="text-red-600">*</span>
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

                <p className="mt-1 text-xs font-bold text-[#697386]">
                  Photo is compulsory for ID verification
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>

        <Input label="Name *" value={name} onChange={setName} />

        <Input
          label="Mobile *"
          value={mobile}
          onChange={setMobile}
          placeholder="10 digit mobile or 00"
        />

        <div>
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Address <span className="text-red-600">*</span>
          </label>

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Enter full address"
            className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
          />
        </div>

        <ProfessionalDropdown
          dropdownKey="seva"
          title="Seva *"
          placeholder={
            sevas.length === 0
              ? "No seva assigned to you"
              : "Select seva"
          }
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
        />

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
        />

        <div className="rounded-[26px] border border-[#d9e0ee] bg-[#f8fafc] p-4">
          <label className="mb-2 block text-sm font-black text-[#172033]">
            Add Other Access Optional
          </label>

          <div className="flex gap-2">
            <input
              value={customAccessText}
              onChange={(e) => setCustomAccessText(e.target.value)}
              placeholder="Example: Store Room"
              className="min-w-0 flex-1 rounded-2xl border border-[#d9e0ee] bg-white px-4 py-3 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
            />

            <button
              type="button"
              onClick={addCustomAccessArea}
              className="rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white"
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
                  onClick={() => removeCustomAccessArea(item)}
                  className="rounded-full bg-[#102a56] px-4 py-2 text-xs font-black text-white"
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
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Any important note"
            className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
          />
        </div>

        <LoadingButton
          type="submit"
          loading={saving}
          loadingText="Saving sadhak..."
        >
          Save Sadhak
        </LoadingButton>
      </form>
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
    setOpenDropdown(isOpen ? "" : dropdownKey);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-sm font-black text-[#172033]">
        {title}
      </label>

      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm font-black outline-none transition ${
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
              onClick={() => onToggle(item.id)}
              className={`rounded-full px-4 py-2 text-xs font-black ${accentClass}`}
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
                    className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition active:scale-[0.99] ${
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
            className="mt-3 w-full rounded-2xl bg-[#eef3fb] px-4 py-3 text-sm font-black text-[#102a56]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}