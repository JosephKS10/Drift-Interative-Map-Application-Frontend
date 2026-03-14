import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useChat — manages chat state for conversations with agents.
 *
 * @param {object} socketRef - ref to Socket.IO instance from useSocket
 * @returns chat state + actions
 */
export function useChat(socketRef) {
  // Message history per agent: agentId → Array<{ role, content, timestamp }>
  const [histories, setHistories] = useState({});
  const [typing, setTyping] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(null);

  // Listen for socket events
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onTyping = ({ agentId, typing: isTyping }) => {
      if (agentId === currentAgentId) {
        setTyping(isTyping);
      }
    };

    const onResponse = ({ agentId, content, mood, mentionedAgents, mentionedPlaces, relationship }) => {
      if (!content) return;

      setHistories((prev) => ({
        ...prev,
        [agentId]: [
          ...(prev[agentId] || []),
          {
            role: "agent",
            content,
            mood,
            mentionedAgents: mentionedAgents || [],
            mentionedPlaces: mentionedPlaces || [],
            timestamp: Date.now(),
          },
        ],
      }));

      setTyping(false);
    };

    socket.on("chat:typing", onTyping);
    socket.on("chat:response", onResponse);

    return () => {
      socket.off("chat:typing", onTyping);
      socket.off("chat:response", onResponse);
    };
  }, [socketRef, currentAgentId]);

  /**
   * Start a chat session with an agent.
   */
  const startChat = useCallback(
    (agentId) => {
      const socket = socketRef?.current;
      if (!socket) return;

      setCurrentAgentId(agentId);
      socket.emit("chat:start", { agentId }, (ack) => {
        if (!ack?.ok) console.error("[Chat] Start failed:", ack?.error);
      });
    },
    [socketRef]
  );

  /**
   * Send a message to the active agent.
   */
  const sendMessage = useCallback(
    (agentId, message, userLocation) => {
      const socket = socketRef?.current;
      if (!socket || !message.trim()) return;

      // Add user message to history immediately
      setHistories((prev) => ({
        ...prev,
        [agentId]: [
          ...(prev[agentId] || []),
          { role: "user", content: message, timestamp: Date.now() },
        ],
      }));

      // Emit to backend
      socket.emit("chat:message", {
        agentId,
        message: message.trim(),
        userLocation,
      });
    },
    [socketRef]
  );

  /**
   * End the chat session.
   */
  const endChat = useCallback(
    (agentId) => {
      const socket = socketRef?.current;
      if (!socket) return;

      socket.emit("chat:end", { agentId });
      setCurrentAgentId(null);
      setTyping(false);
    },
    [socketRef]
  );

  /**
   * Get message history for a specific agent.
   */
  const getHistory = useCallback(
    (agentId) => histories[agentId] || [],
    [histories]
  );

  return {
    typing,
    startChat,
    sendMessage,
    endChat,
    getHistory,
  };
}
