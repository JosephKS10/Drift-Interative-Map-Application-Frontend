import { useEffect, useRef } from "react";
import { useDrift } from "../../context/DriftContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatPanel({ agentId, chat, onClose }) {
  const { activeAgent, userLocation, openChat } = useDrift();
  const agent = activeAgent;

  console.log(openChat, "openChat function from context");

  // Start the chat session when panel opens
  useEffect(() => {
    if (agentId) {
      chat.startChat(agentId);
    }
    return () => {
      if (agentId) chat.endChat(agentId);
    };
  }, [agentId]);

  if (!agent) return null;

  const messages = chat.getHistory(agentId);

  const handleSend = (message) => {
    chat.sendMessage(agentId, message, userLocation);
  };

  const handleAgentClick = (mentionedAgentId) => {
    onClose();
    setTimeout(() => openChat(mentionedAgentId), 350);
  };

  return (
    <div className="h-full flex flex-col  border-l border-slate-800/50">
      {/* Header */}
      <ChatHeader agent={agent} onClose={onClose} />

      {/* Messages */}
      <MessageList
        messages={messages}
        agent={agent}
        typing={chat.typing}
        onAgentClick={handleAgentClick}
      />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={chat.typing} agentName={agent.name.split(" ")[0]} />
    </div>
  );
}
