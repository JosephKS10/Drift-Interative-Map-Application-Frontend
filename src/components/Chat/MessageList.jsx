import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import AgentAvatar from "../Agent/AgentAvatar";

export default function MessageList({ messages, agent, typing, onAgentClick }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages">
      {/* Empty state */}
      {messages.length === 0 && !typing && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-3xl mb-3 overflow-hidden">
            <AgentAvatar agentId={agent.id} avatar={agent.avatar} scale={1.9} offsetY="-16%" />
          </div>
          <div className="text-slate-400 text-sm font-medium">
            {agent.name.split(" ")[0]}
          </div>
          <div className="text-slate-600 text-xs mt-1 max-w-[200px]">
            {agent.role} · {agent.location?.building}
          </div>
          <div className="text-slate-700 text-[11px] mt-4 italic max-w-[240px]">
            Say hi to start a conversation
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <ChatBubble
          key={i}
          message={msg}
          agent={agent}
          onAgentClick={onAgentClick}
        />
      ))}

      {/* Typing indicator */}
      {typing && <TypingIndicator agent={agent} />}

      <div ref={bottomRef} />
    </div>
  );
}
