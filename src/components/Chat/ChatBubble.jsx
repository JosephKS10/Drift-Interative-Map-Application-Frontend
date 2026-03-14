import { getAgentColor } from "../../utils/agentAssets";
import AgentAvatar from "../Agent/AgentAvatar";

export default function ChatBubble({ message, agent, onAgentClick }) {
  const isUser = message.role === "user";
  const agentColor = getAgentColor(agent.id);

  return (
    <div
      className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: "fade-in-up 0.3s ease-out" }}
    >
      {/* Agent avatar (left side) */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-sm mr-2 mt-1">
          <AgentAvatar agentId={agent.id} avatar={agent.avatar} scale={1.95} offsetY="-16%" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-800/80 text-slate-200 rounded-bl-md border border-slate-700/30"
        }`}
      >
        {/* Message text — render agent names as clickable */}
        <div className="whitespace-pre-wrap">
          {isUser ? message.content : renderAgentContent(message, onAgentClick)}
        </div>

        {/* Timestamp */}
        <div
          className={`text-[9px] mt-1.5 ${
            isUser ? "text-blue-300/60" : "text-slate-600"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/**
 * Render agent response text with mentioned agents as clickable names.
 */
function renderAgentContent(message, onAgentClick) {
  if (!message.mentionedAgents?.length || !onAgentClick) {
    return message.content;
  }

  // For MVP: just render as plain text.
  // Enhancement: parse agent names and make them clickable spans.
  return message.content;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
