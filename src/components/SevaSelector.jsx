import { sevaOptions } from "@/constants/sevaOptions";

export default function SevaSelector({ value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#4c3a2f]">
        Select Seva
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-4 text-base font-bold text-[#2f241d] shadow-sm outline-none transition focus:border-[#8a5d3c] focus:bg-white"
      >
        <option value="">Choose seva</option>

        {sevaOptions.map((seva) => (
          <option key={seva} value={seva}>
            {seva}
          </option>
        ))}
      </select>
    </div>
  );
}