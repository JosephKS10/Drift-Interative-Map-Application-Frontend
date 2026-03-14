import businessmanStand from "../assets/lottie/businessman-stand-with-arms-crossed.json";
import businessmanThinking from "../assets/lottie/businessman-thinking.json";
import businessmanWaving from "../assets/lottie/businessman-waving.json";
import salesmanStand from "../assets/lottie/salesman-stand-with-arms-crossed.json";
import salesmanThinking from "../assets/lottie/salesman-thinking.json";
import salesmanWaving from "../assets/lottie/salesman-waving.json";

/**
 * Agent visual asset utilities.
 *
 * Maps mood states to expression images.
 * Falls back to emoji avatars if custom art isn't loaded.
 */

const MOOD_TO_EXPRESSION = {
  cheerful: "happy",
  engaged: "happy",
  contemplative: "thinking",
  wired: "surprised",
  zombie: "thinking",
  peaceful: "neutral",
  mysterious: "neutral",
  asleep: "neutral",
  grumpy: "thinking",
  delirious: "surprised",
};

export function getExpression(mood) {
  return MOOD_TO_EXPRESSION[mood] || "neutral";
}

export function getAgentImagePath(agentId, mood) {
  const name = agentId.replace("agent-", "");
  const expression = getExpression(mood);
  return `/agents/${name}/${expression}.png`;
}

export function getWaveFrames(agentId) {
  const name = agentId.replace("agent-", "");
  return [
    `/agents/${name}/wave-1.png`,
    `/agents/${name}/wave-2.png`,
    `/agents/${name}/wave-3.png`,
  ];
}

/**
 * Mood to color mapping for visual indicators.
 */
export function getMoodColor(mood) {
  const colors = {
    cheerful: "#f59e0b",
    engaged: "#22c55e",
    contemplative: "#6366f1",
    wired: "#3b82f6",
    zombie: "#64748b",
    peaceful: "#8b5cf6",
    mysterious: "#84cc16",
    asleep: "#475569",
    grumpy: "#ef4444",
    delirious: "#ec4899",
  };
  return colors[mood] || "#94a3b8";
}

/**
 * Agent theme colors (for border rings, accents).
 */
export const AGENT_COLORS = {
  // Clayton
  "agent-arjun": "#8b5cf6",
  "agent-zoe": "#3b82f6",
  "agent-marko": "#22c55e",
  "agent-aisha": "#f59e0b",
  "agent-rosa": "#ef4444",
  "agent-jin": "#06b6d4",
  "agent-talia": "#ec4899",
  "agent-doug": "#84cc16",
  // Melbourne
  "agent-vinnie": "#ef4444",
  "agent-sable": "#ec4899",
  "agent-mei": "#f59e0b",
  "agent-tram-tony": "#22c55e",
  "agent-banksy": "#6366f1",
  "agent-frankie": "#8b5cf6",
  "agent-charlie": "#84cc16",
  "agent-raj-m": "#f97316",
  "agent-luna": "#06b6d4",
  "agent-jaz": "#8b5cf6",
  "agent-helen": "#6366f1",
  "agent-diego": "#ef4444",
  "agent-noor": "#f59e0b",
  "agent-felix": "#ec4899",
  "agent-sam-m": "#3b82f6",
  "agent-ada": "#22c55e",
  "agent-ocean": "#06b6d4",
  "agent-kit": "#8b5cf6",
  "agent-bev": "#f59e0b",
  "agent-yuki": "#ec4899",
  "agent-murray": "#84cc16",
};

export function getAgentColor(agentId) {
  return AGENT_COLORS[agentId] || "#94a3b8";
}

const AGENT_MARKER_ANIMATIONS = {
  "agent-arjun": {
    default: businessmanStand,
    thinking: businessmanThinking,
    waving: businessmanWaving,
  },
  "agent-zoe": {
    default: salesmanStand,
    thinking: salesmanThinking,
    waving: salesmanWaving,
  },
};

export function getAgentMarkerAnimation(agentId, zone) {
  const animations = AGENT_MARKER_ANIMATIONS[agentId];
  if (!animations) return null;

  if (zone === "intimate") {
    return animations.waving;
  }

  if (zone === "nearby" || zone === "vicinity") {
    return animations.thinking;
  }

  return animations.default;
}
