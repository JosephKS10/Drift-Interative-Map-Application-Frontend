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
  "agent-arjun": "#8b5cf6",
  "agent-zoe": "#3b82f6",
  "agent-marko": "#22c55e",
  "agent-aisha": "#f59e0b",
  "agent-rosa": "#ef4444",
  "agent-jin": "#06b6d4",
  "agent-talia": "#ec4899",
  "agent-doug": "#84cc16",
};

export function getAgentColor(agentId) {
  return AGENT_COLORS[agentId] || "#94a3b8";
}
