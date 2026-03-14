import Lottie from "lottie-react";
import { getMoodColor, getAgentColor, getAgentMarkerAnimation } from "../../utils/agentAssets";

export default function AgentMarker({ agent, proximity, onClick, zoom = 15 }) {
  const zone = proximity?.zone;
  const isAsleep = agent.mood === "asleep";
  const isZombie = agent.mood === "zombie";
  const dimmed = isAsleep || isZombie;
  const animationData = getAgentMarkerAnimation(agent.id, zone);
  const isHere = zone === "intimate";

  // Size based on proximity
  const baseSize =
    zone === "intimate" ? 94 :
    zone === "nearby" ? 76 :
    zone === "vicinity" ? 74 : 60;
  const normalizedZoom = zoom / 15;
  const zoomScale = Math.min(1.28, Math.max(0.3, Math.pow(normalizedZoom, 1.15)));
  const hereScaleModifier = isHere ? Math.min(1, 0.82 + zoomScale * 0.18) : 1;
  const size = Math.round(baseSize * zoomScale * hereScaleModifier);

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
  const baseAnimationScale =
    zone === "intimate" ? 2.16 :
    zone === "nearby" ? 2.15 :
    zone === "vicinity" ? 1.95 :
    2.05;
  const animationScale = baseAnimationScale * (0.76 + zoomScale * 0.24);
  const animationOffsetY = isHere ? "-42%" : zone === "vicinity" ? "-24%" : "-30%";

  const stopEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      data-agent-marker="true"
      className={`${animClass} relative cursor-pointer`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${Math.max(2, Math.round(3 * zoomScale))}px solid ${zone ? borderColor : borderColor + "66"}`,
        boxShadow: glow,
        opacity: dimmed ? 0.5 : 1,
        filter: dimmed ? "grayscale(40%)" : "none",
        transition: "width 0.4s, height 0.4s, box-shadow 0.4s, opacity 0.3s",
      }}
      onMouseDown={stopEvent}
      onTouchStart={stopEvent}
      onClick={(e) => {
        stopEvent(e);
        onClick();
      }}
    >
      {/* Avatar — emoji for MVP, swap with PNG later */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm text-lg z-10 select-none relative"
        style={{ fontSize: size * 0.45 }}
      >
        {animationData ? (
          <div
            className="absolute inset-0"
            style={{
              // height: isHere ? "208%" : "auto" ,
              overflow: isHere ? "visible" : "hidden",
              borderRadius: "50%",
            }}
          >
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="absolute left-1/2 top-1/2 pointer-events-none"
              style={{
                width: `${animationScale * 100}%`,
                height: `${animationScale * 100}%`,
                transform: `translate(-50%, ${animationOffsetY})`,
                
              }}
            />
          </div>
        ) : (
          agent.avatar
        )}
      </div>

      {/* Name label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 font-semibold text-slate-200 whitespace-nowrap pointer-events-none"
        style={{
          bottom: -18,
          fontSize: Math.max(10, Math.round(12 * zoomScale)),
          textShadow: "0 1px 4px rgba(0,0,0,0.9)",
        }}
      >
        {agent.name.split(" ")[0]}
      </div>

      {/* Mood indicator dot */}
      <div
        className="absolute bottom-0 right-0 rounded-full border-slate-950"
        style={{
          width: Math.max(8, Math.round(10 * zoomScale)),
          height: Math.max(8, Math.round(10 * zoomScale)),
          borderWidth: Math.max(1, Math.round(2 * zoomScale)),
          background: moodColor,
          transition: "background 0.3s",
        }}
      />

      {/* Proximity badge */}
      {zone && zone !== "far" && (
        <div
          className="absolute font-bold rounded-full text-slate-950"
          style={{
            top: Math.round(-8 * zoomScale),
            right: Math.round(-8 * zoomScale),
            fontSize: Math.max(6, Math.round(7 * zoomScale)),
            padding: `${Math.max(1, Math.round(2 * zoomScale))}px ${Math.max(4, Math.round(6 * zoomScale))}px`,
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
            border: `${Math.max(1, Math.round(2 * zoomScale))}px solid ${borderColor}66`,
            animation: "pulse-ring 2s ease-out infinite",
          }}
        />
      )}
    </div>
  );
}
