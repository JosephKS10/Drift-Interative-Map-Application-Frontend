import { useEffect, useState } from "react";
import { getAgentColor } from "../../utils/agentAssets";
import AgentAvatar from "../Agent/AgentAvatar";

export default function ChatBubble({ message, agent, onAgentClick }) {
  const isUser = message.role === "user";
  const agentColor = getAgentColor(agent.id);

  const [visibleParts, setVisibleParts] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  /*
  Split agent message into multiple parts
  */
  const parts = !isUser
    ? message.content
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [message.content];

  /*
  Animate AI message delivery with typing indicator
  */
  useEffect(() => {
    if (isUser) {
      setVisibleParts(parts);
      return;
    }

    let index = 0;

    setVisibleParts([]);
    setIsTyping(true);

    const showNext = () => {
      if (index >= parts.length) {
        setIsTyping(false);
        return;
      }

      const nextPart = parts[index];

      if (nextPart && nextPart.trim().length > 0) {
        setIsTyping(false);
        setVisibleParts((prev) => [...prev, nextPart]);
      }

      index++;

      if (index < parts.length) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(showNext, 1700);
        }, 200);
      } else {
        setIsTyping(false);
      }
    };

    const initialDelay = setTimeout(showNext, 1700);

    return () => clearTimeout(initialDelay);
  }, [message.content]);

  return (
    <>
      {visibleParts.map((text, i) => {
        if (!text || !text.trim()) return null;

        return (
          <div
            key={i}
            className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}
            style={{ animation: "fade-in-up 0.3s ease-out" }}
          >
            {/* Agent avatar column */}
            {!isUser && (
              <div className="shrink-0 w-7 h-7 mr-2 mt-1 flex items-center justify-center">
                {i === 0 && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-sm">
                    <AgentAvatar
                      agentId={agent.id}
                      avatar={agent.avatar}
                      scale={1.95}
                      offsetY="-16%"
                    />
                  </div>
                )}
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
              <div className="whitespace-pre-wrap">
                {isUser
                  ? text
                  : renderAgentContent(
                      { ...message, content: text },
                      onAgentClick
                    )}
              </div>

              {/* Timestamp only on final bubble */}
              {i === visibleParts.length - 1 && !isTyping && (
                <div
                  className={`text-[9px] mt-1.5 ${
                    isUser ? "text-blue-300/60" : "text-slate-600"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {!isUser && isTyping && (
        <div
          className="flex mb-3 justify-start"
          style={{ animation: "fade-in-up 0.3s ease-out" }}
        >
          <div className="shrink-0 w-7 h-7 mr-2 mt-1 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-sm">
              <AgentAvatar
                agentId={agent.id}
                avatar={agent.avatar}
                scale={1.95}
                offsetY="-16%"
              />
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/30 text-slate-300 text-[13px]">
            <div className="flex gap-1">
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-100">•</span>
              <span className="animate-bounce delay-200">•</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Render agent response text with mentioned agents as clickable names.
 */
function renderAgentContent(message, onAgentClick) {
  if (!message.mentionedAgents?.length || !onAgentClick) {
    return message.content;
  }

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
