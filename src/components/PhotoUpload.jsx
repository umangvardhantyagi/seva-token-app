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

    e.target.value = "";
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
        Person Photo
      </label>

      <div className="overflow-hidden rounded-[30px] border border-[#e4d1bd] bg-gradient-to-br from-[#ffffff] via-[#f8efe5] to-[#efe0cf] p-3 shadow-[0_14px_35px_rgba(77,50,31,0.10)]">
        {preview ? (
          <div className="relative overflow-hidden rounded-[26px]">
            <img
              src={preview}
              alt="Selected person"
              className="h-64 w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
              <p className="text-sm font-black text-white">Photo selected</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[26px] border border-[#deccb8] bg-[#f7ecdf] px-5 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d5bda4] bg-[#ffffff] shadow-[0_10px_25px_rgba(77,50,31,0.08)]">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8a5d3c]">
                Photo
              </span>
            </div>

            <p className="text-lg font-black text-[#2f241d]">
              Add Person Photo
            </p>

            <p className="mx-auto mt-2 max-w-[260px] text-sm font-semibold leading-6 text-[#715b48]">
              Take a fresh photo or choose one from gallery.
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#8a5d3c] to-[#633b27] px-4 py-4 text-center text-sm font-black text-white shadow-[0_10px_25px_rgba(123,79,50,0.22)] active:scale-[0.99]">
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="sr-only"
            />
          </label>

          <label className="cursor-pointer rounded-2xl border border-[#d7c3ac] bg-[#ffffff] px-4 py-4 text-center text-sm font-black text-[#7b4f32] shadow-sm active:scale-[0.99]">
            Choose Photo
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