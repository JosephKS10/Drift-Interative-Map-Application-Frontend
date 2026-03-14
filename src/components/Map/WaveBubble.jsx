import { useEffect, useState } from "react";

export default function WaveBubble({ data, onDismiss, onClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 6 seconds
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);

    return () => clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div
      className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-30 cursor-pointer transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl px-4 py-3 max-w-xs shadow-xl shadow-black/30">
        {/* Avatar */}
        <div className="text-2xl shrink-0">{data.avatar}</div>

        <div className="min-w-0">
          {/* Name */}
          <div className="text-[10px] font-bold text-amber-400 tracking-wider">
            {data.name}
          </div>
          {/* Message */}
          <div className="text-sm text-slate-200 leading-snug mt-0.5 italic">
            "{data.message}"
          </div>
          {/* Tap hint */}
          <div className="text-[9px] text-slate-600 mt-1">
            tap to chat
          </div>
        </div>
      </div>
    </div>
  );
}
