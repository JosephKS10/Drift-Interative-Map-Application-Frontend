import Lottie from "lottie-react";
import { getAgentMarkerAnimation } from "../../utils/agentAssets";

export default function AgentAvatar({
  agentId,
  avatar,
  zone,
  className = "",
  scale = 1.85,
  offsetY = "-12%",
  fallbackClassName = "",
}) {
  const animationData = agentId ? getAgentMarkerAnimation(agentId, zone) : null;

  if (!animationData) {
    return <span className={fallbackClassName}>{avatar || "?"}</span>;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: `${scale * 100}%`,
          height: `${scale * 100}%`,
          transform: `translate(-50%, ${offsetY})`,
        }}
      />
    </div>
  );
}
