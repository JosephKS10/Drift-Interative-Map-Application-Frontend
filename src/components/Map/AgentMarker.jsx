import { getMoodColor, getAgentColor } from "../../utils/agentAssets";

export default function AgentMarker({ agent, proximity, onClick }) {
  const zone = proximity?.zone;
  const isAsleep = agent.mood === "asleep";
  const isZombie = agent.mood === "zombie";
  const dimmed = isAsleep || isZombie;

  // Size based on proximity
  const size =
    zone === "intimate" ? 68 :
    zone === "nearby" ? 56 :
    zone === "vicinity" ? 48 : 42;

  // Border color = agent theme color
  const borderColor = getAgentColor(agent.id);

  // Glow based on proximity
  const glow =
    zone === "intimate"
      ? `0 0 20px ${borderColor}88, 0 0 40px ${borderColor}33`
    : zone === "nearby"
      ? `0 0 12px ${borderColor}44`
    : "0 2px 8px rgba(0,0,0,0.4)";

  // Animation class
  const animClass =
    zone === "intimate" ? "agent-bubble agent-bubble-intimate" :
    "agent-bubble";

  // Mood dot
  const moodColor = getMoodColor(agent.mood);

  return (
    <div
      className={`${animClass} relative cursor-pointer`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${zone ? borderColor : borderColor + "66"}`,
        boxShadow: glow,
        opacity: dimmed ? 0.5 : 1,
        filter: dimmed ? "grayscale(40%)" : "none",
        transition: "width 0.4s, height 0.4s, box-shadow 0.4s, opacity 0.3s",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Avatar — emoji for MVP, swap with PNG later */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm text-lg select-none"
        style={{ fontSize: size * 0.45 }}
      >
        {agent.avatar}
      </div>

      {/* Name label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-200 whitespace-nowrap pointer-events-none"
        style={{
          bottom: -18,
          textShadow: "0 1px 4px rgba(0,0,0,0.9)",
        }}
      >
        {agent.name.split(" ")[0]}
      </div>

      {/* Mood indicator dot */}
      <div
        className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full border-2 border-slate-950"
        style={{
          background: moodColor,
          transition: "background 0.3s",
        }}
      />

      {/* Proximity badge */}
      {zone && zone !== "far" && (
        <div
          className="absolute -top-2 -right-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full text-slate-950"
          style={{
            background: borderColor,
            animation: "badge-pop 0.3s ease-out",
          }}
        >
          {zone === "intimate" ? "HERE" : "NEAR"}
        </div>
      )}

      {/* Pulse ring for intimate proximity */}
      {zone === "intimate" && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `2px solid ${borderColor}66`,
            animation: "pulse-ring 2s ease-out infinite",
          }}
        />
      )}
    </div>
  );
}
