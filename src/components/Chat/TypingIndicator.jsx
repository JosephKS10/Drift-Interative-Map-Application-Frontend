export default function TypingIndicator({ agent }) {
  return (
    <div className="flex items-center gap-2 mb-3" style={{ animation: "fade-in-up 0.3s ease-out" }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-sm">
        {agent.avatar}
      </div>
      <div className="bg-slate-800/80 border border-slate-700/30 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1">
            {agent.name.split(" ")[0]} is thinking
          </span>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-500"
              style={{
                animation: `breathe 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
