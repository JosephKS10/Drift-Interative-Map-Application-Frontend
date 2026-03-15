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
      {/* Agent avatar */}
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
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <AgentMessage message={message} onAgentClick={onAgentClick} />
        )}

        {/* Timestamp */}
        <div className={`text-[9px] mt-1.5 ${isUser ? "text-blue-300/60" : "text-slate-600"}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/* ── Agent message renderer ─────────────────────── */
function AgentMessage({ message, onAgentClick }) {
  const paragraphs = splitIntoParagraphs(message.content);

  return (
    <div className="flex flex-col gap-2">
      {paragraphs.map((para, i) => {
        // Bullet point line
        if (para.startsWith("•") || para.startsWith("-")) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-slate-500 mt-0.5 shrink-0 text-[10px]">•</span>
              <span className="text-slate-200 leading-relaxed">{para.replace(/^[•\-]\s*/, "")}</span>
            </div>
          );
        }

        // Numbered line
        if (/^\d+[\.\)]/.test(para)) {
          const num = para.match(/^(\d+)/)[1];
          return (
            <div key={i} className="flex items-start gap-2">
              <span
                className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
              >
                {num}
              </span>
              <span className="text-slate-200 leading-relaxed">{para.replace(/^\d+[\.\)]\s*/, "")}</span>
            </div>
          );
        }

        // Regular paragraph — dim if it's a follow-up (not the first)
        return (
          <p
            key={i}
            className={`leading-relaxed whitespace-pre-wrap ${i === 0 ? "text-slate-200" : "text-slate-400"}`}
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────── */

/**
 * Splits a long blob of text into digestible paragraphs.
 * — Respects existing newlines
 * — Breaks run-on sentences longer than ~180 chars at a natural sentence boundary
 */
function splitIntoParagraphs(text) {
  if (!text) return [];

  // First split on existing newlines
  const rawLines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);

  const result = [];

  for (const line of rawLines) {
    // If the line is short enough, keep as-is
    if (line.length <= 180) {
      result.push(line);
      continue;
    }

    // Break long lines at sentence boundaries (. ! ?) followed by a space
    const sentences = line.match(/[^.!?]+[.!?]+(\s|$)/g) || [line];
    let chunk = "";

    for (const sentence of sentences) {
      if ((chunk + sentence).length > 180 && chunk.length > 0) {
        result.push(chunk.trim());
        chunk = sentence;
      } else {
        chunk += sentence;
      }
    }

    if (chunk.trim()) result.push(chunk.trim());
  }

  return result;
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