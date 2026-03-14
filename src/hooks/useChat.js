import { useState, useCallback, useEffect } from "react";

export function useChat(socketRef) {
  const [histories, setHistories] = useState({});
  const [typing, setTyping] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(null);

  // Store placeCards and nearbyPlaces per agent (from latest response)
  const [placesData, setPlacesData] = useState({});
  // agentId → { placeCards: [], nearbyPlaces: [], loading: false }

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onTyping = ({ agentId, typing: isTyping }) => {
      if (agentId === currentAgentId) {
        setTyping(isTyping);

        // When typing starts, set places loading
        if (isTyping) {
          setPlacesData((prev) => ({
            ...prev,
            [agentId]: { ...prev[agentId], loading: true },
          }));
        }
      }
    };

    const onResponse = ({
      agentId,
      content,
      mood,
      mentionedAgents,
      mentionedPlaces,
      placeCards,
      nearbyPlaces,
      relationship,
    }) => {
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
            placeCards: placeCards || [],
            nearbyPlaces: nearbyPlaces || [],
            timestamp: Date.now(),
          },
        ],
      }));

      // Update places data for this agent
      setPlacesData((prev) => ({
        ...prev,
        [agentId]: {
          placeCards: placeCards || [],
          nearbyPlaces: nearbyPlaces || [],
          loading: false,
        },
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

  const startChat = useCallback(
    (agentId) => {
      const socket = socketRef?.current;
      if (!socket) return;
      setCurrentAgentId(agentId);
      // Clear previous places data for fresh start
      setPlacesData((prev) => ({
        ...prev,
        [agentId]: { placeCards: [], nearbyPlaces: [], loading: false },
      }));
      socket.emit("chat:start", { agentId }, (ack) => {
        if (!ack?.ok) console.error("[Chat] Start failed:", ack?.error);
      });
    },
    [socketRef]
  );

  const sendMessage = useCallback(
    (agentId, message, userLocation) => {
      const socket = socketRef?.current;
      if (!socket || !message.trim()) return;

      setHistories((prev) => ({
        ...prev,
        [agentId]: [
          ...(prev[agentId] || []),
          { role: "user", content: message, timestamp: Date.now() },
        ],
      }));

      socket.emit("chat:message", {
        agentId,
        message: message.trim(),
        userLocation,
      });
    },
    [socketRef]
  );

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

  const getHistory = useCallback(
    (agentId) => histories[agentId] || [],
    [histories]
  );

  const getPlacesData = useCallback(
    (agentId) => placesData[agentId] || { placeCards: [], nearbyPlaces: [], loading: false },
    [placesData]
  );

  return {
    typing,
    startChat,
    sendMessage,
    endChat,
    getHistory,
    getPlacesData,
  };
}