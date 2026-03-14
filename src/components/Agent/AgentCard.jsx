import { getMoodColor, getAgentColor } from "../../utils/agentAssets";

export default function AgentCard({ agent, isActive, onClick }) {
  const agentColor = getAgentColor(agent.id);
  const moodColor = getMoodColor(agent.mood);
  const isAsleep = agent.mood === "asleep";

  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
        isActive
          ? "bg-slate-800 border-slate-600"
          : "bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700/50"
      }`}
      style={isActive ? { borderColor: agentColor + "66" } : {}}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 border-2 text-sm ${
            isAsleep ? "opacity-50 grayscale" : ""
          }`}
          style={{ borderColor: isActive ? agentColor : "transparent" }}
        >
          {agent.avatar}
        </div>
        {/* Mood dot */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950"
          style={{ background: moodColor }}
        />
      </div>

      {/* Name + status */}
      <div className="text-left min-w-0">
        <div className="text-[11px] font-semibold text-slate-300 truncate">
          {agent.name.split(" ")[0]}
        </div>
        <div className="text-[9px] text-slate-600 truncate max-w-[80px]">
          {agent.mood}
        </div>
      </div>
    </button>
  );
}
