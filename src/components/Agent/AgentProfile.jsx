import { useState, useEffect } from "react";
import { fetchAgentProfile, fetchAgentMemories } from "../../services/api";
import { getAgentColor, getMoodColor } from "../../utils/agentAssets";

/**
 * AgentProfile — expanded view of an agent.
 * Shows personality, traits, relationship, memories.
 * Used as an overlay or section in the chat panel (Phase 5 polish).
 */
export default function AgentProfile({ agentId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAgentProfile(agentId),
      fetchAgentMemories(agentId).catch(() => null),
    ]).then(([prof, mem]) => {
      setProfile(prof);
      setMemories(mem);
      setLoading(false);
    });
  }, [agentId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-600 text-sm">Loading profile...</div>
    );
  }

  if (!profile) return null;

  const agentColor = getAgentColor(agentId);
  const moodColor = getMoodColor(profile.state?.mood);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 border-2 text-2xl"
          style={{ borderColor: agentColor }}
        >
          {profile.avatar}
        </div>
        <div>
          <div className="font-bold text-slate-100">{profile.name}</div>
          <div className="text-xs text-slate-500">{profile.role} · {profile.age}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ background: moodColor }} />
            <span className="text-[11px] text-slate-500">{profile.state?.activity}</span>
          </div>
        </div>
      </div>

      {/* Traits */}
      <div>
        <div className="text-[10px] text-slate-600 font-semibold tracking-wider mb-2">TRAITS</div>
        <div className="flex flex-wrap gap-1.5">
          {profile.personality?.traits?.map((trait) => (
            <span
              key={trait}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Backstory */}
      <div>
        <div className="text-[10px] text-slate-600 font-semibold tracking-wider mb-2">ABOUT</div>
        <div className="text-xs text-slate-400 leading-relaxed">
          {profile.personality?.backstory}
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="text-[10px] text-slate-600 font-semibold tracking-wider mb-2">LOCATION</div>
        <div className="text-xs text-slate-400">
          📍 {profile.location?.building} — {profile.location?.address}
        </div>
      </div>

      {/* Memories */}
      {memories?.entries?.length > 0 && (
        <div>
          <div className="text-[10px] text-slate-600 font-semibold tracking-wider mb-2">
            WHAT THEY REMEMBER ABOUT YOU
          </div>
          <div className="space-y-1.5">
            {memories.entries.map((entry, i) => (
              <div key={i} className="text-[11px] text-slate-500 pl-3 border-l-2 border-slate-800">
                <span className="text-slate-600">{entry.timeAgo}:</span> {entry.summary}
              </div>
            ))}
          </div>
          {memories.relationship && (
            <div className="text-[11px] text-slate-600 mt-2">
              Relationship: <span className="text-slate-400 font-medium">{memories.relationship.level}</span>
              {" · "}
              {memories.relationship.totalExchanges} conversations
            </div>
          )}
        </div>
      )}
    </div>
  );
}
