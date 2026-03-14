import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDrift } from "../context/DriftContext";

const SOCKET_URL = import.meta.env.VITE_API_URL || "";

/**
 * useSocket — connects to backend, routes all events to DriftContext.
 * Call this ONCE at the App level.
 */
export function useSocket() {
  const socketRef = useRef(null);
  const {
    updateAgentState,
    setProximity,
    clearProximity,
    showWave,
    addGossipToast,
  } = useDrift();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    // ── Agent State Updates ──────────────────────
    socket.on("agent:update", ({ agentId, mood, activity }) => {
      updateAgentState(agentId, { mood, activity });
    });

    // ── Proximity Events ─────────────────────────
    socket.on("proximity:enter", ({ agentId, name, avatar, distance, zone }) => {
      setProximity(agentId, zone, distance);
    });

    socket.on("proximity:leave", ({ agentId }) => {
      clearProximity(agentId);
    });

    // ── Agent Wave ───────────────────────────────
    socket.on("agent:wave", (data) => {
      showWave(data);
    });

    // ── Gossip ───────────────────────────────────
    socket.on("gossip:new", (data) => {
      addGossipToast(data);
    });

    // ── Errors ───────────────────────────────────
    socket.on("error", ({ message }) => {
      console.error("[Socket] Error:", message);
    });

    return () => {
      socket.disconnect();
    };
  }, [updateAgentState, setProximity, clearProximity, showWave, addGossipToast]);

  return socketRef;
}
