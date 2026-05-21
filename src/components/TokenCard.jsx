export default function TokenCard({ token }) {
  const time =
    token.createdAt?.toDate?.()?.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }) || "";

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
            {token.status || "Assigned"}
          </span>
        </div>

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

        {time && (
          <p className="pt-1 text-xs font-bold text-[#a88a6d]">
            Created at {time}
          </p>
        )}
      </div>
    </article>
  );
}