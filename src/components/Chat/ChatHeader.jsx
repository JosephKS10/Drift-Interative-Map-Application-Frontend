import { getMoodColor, getAgentColor } from "../../utils/agentAssets";
import AgentAvatar from "../Agent/AgentAvatar";

export default function ChatHeader({ agent, onClose }) {
  const moodColor = getMoodColor(agent.mood);
  const agentColor = getAgentColor(agent.id);

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-800/50"
      style={{ background: `linear-gradient(135deg, ${agentColor}08, transparent)` }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border-2 text-xl"
        style={{ borderColor: agentColor }}
      >
        <AgentAvatar agentId={agent.id} avatar={agent.avatar} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-100 truncate">
          {agent.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Mood dot */}
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: moodColor }}
          />
          <span className="text-slate-500 truncate max-w-[160px] text-xs">
  {agent.activity || agent.mood}
</span>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
