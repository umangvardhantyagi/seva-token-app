"use client";

import { useEffect, useState } from "react";

export default function PhotoUpload({ onChange, resetKey }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setPreview("");
  }, [resetKey]);

  function handlePhoto(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange(file);

    // Allows selecting the same photo again if needed
    e.target.value = "";
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
        Person Photo
      </label>

      <div className="rounded-[26px] border border-[#eadfce] bg-[#fffaf3] p-3 shadow-sm">
        {preview ? (
          <img
            src={preview}
            alt="Selected person"
            className="h-60 w-full rounded-[22px] object-cover"
          />
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#d5bea6] bg-[#f8f0e7] px-5 py-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-[#d5bea6] bg-[#fffaf3]" />
            <p className="text-base font-black text-[#4c3a2f]">
              No photo selected
            </p>
            <p className="mt-2 text-sm leading-6 text-[#715b48]">
              Take a new photo or choose from gallery.
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="cursor-pointer rounded-2xl bg-[#7b4f32] px-4 py-4 text-center text-sm font-black text-white shadow-md active:scale-[0.99]">
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="sr-only"
            />
          </label>

          <label className="cursor-pointer rounded-2xl border border-[#d7c3ac] bg-[#f8f0e7] px-4 py-4 text-center text-sm font-black text-[#7b4f32] active:scale-[0.99]">
            Gallery
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}