export default function GossipToast({ data, onClick }) {
  return (
    <div
      className="pointer-events-auto cursor-pointer bg-slate-900/90 backdrop-blur-md border border-purple-500/20 rounded-xl px-3 py-2 max-w-[240px] shadow-lg"
      style={{ animation: "toast-in 0.4s ease-out" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-purple-400 text-xs">🗣️</span>
        <span className="text-[11px] text-slate-300 leading-snug">
          <span className="font-semibold text-purple-300">{data.from}</span>
          {" mentioned "}
          <span className="font-semibold text-purple-300">{data.about}</span>
          {" to you"}
        </span>
      </div>
      <div className="text-[9px] text-slate-600 mt-1 ml-5">
        tap to visit {data.about}
      </div>
    </div>
  );
}
