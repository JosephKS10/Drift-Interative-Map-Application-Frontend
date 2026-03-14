import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { fetchCampus } from "../services/api";

const DriftContext = createContext(null);

export function useDrift() {
  const ctx = useContext(DriftContext);
  if (!ctx) throw new Error("useDrift must be used within DriftProvider");
  return ctx;
}

export function DriftProvider({ children }) {
  // ── Campus Data ────────────────────────────────
  const [campus, setCampus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Active State ───────────────────────────────
  const [activeAgentId, setActiveAgentId] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // ── User Position ──────────────────────────────
  const [userLocation, setUserLocation] = useState(null);

  // ── Proximity ──────────────────────────────────
  const [proximityData, setProximityData] = useState({}); // agentId → { zone, distance }
  const [waveData, setWaveData] = useState(null); // { agentId, name, avatar, message }

  // ── Gossip ─────────────────────────────────────
  const [gossipToasts, setGossipToasts] = useState([]);

  // ── Load Campus Data on Mount ──────────────────
  useEffect(() => {
    fetchCampus("clayton")
      .then((data) => {
        setCampus(data);
        setAgents(data.agents);
        // Default user position: campus center
        setUserLocation(data.center);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ── Agent Actions ──────────────────────────────

  const openChat = useCallback((agentId) => {
    setActiveAgentId(agentId);
    setChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
    // Delay clearing agentId for exit animation
    setTimeout(() => setActiveAgentId(null), 300);
  }, []);

  // ── Agent State Updates (from backend events) ──

  const updateAgentState = useCallback((agentId, updates) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, ...updates } : a
      )
    );
  }, []);

  // ── Proximity Updates ──────────────────────────

  const setProximity = useCallback((agentId, zone, distance) => {
    setProximityData((prev) => ({ ...prev, [agentId]: { zone, distance } }));
  }, []);

  const clearProximity = useCallback((agentId) => {
    setProximityData((prev) => {
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
  }, []);

  // ── Wave Management ────────────────────────────

  const showWave = useCallback((data) => {
    setWaveData(data);
  }, []);

  const dismissWave = useCallback(() => {
    setWaveData(null);
  }, []);

  // ── Gossip Toast Management ────────────────────

  const addGossipToast = useCallback((gossip) => {
    const id = Date.now();
    setGossipToasts((prev) => [...prev, { ...gossip, id }]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setGossipToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // ── Helpers ────────────────────────────────────

  const getAgent = useCallback(
    (agentId) => agents.find((a) => a.id === agentId) || null,
    [agents]
  );

  const activeAgent = activeAgentId ? getAgent(activeAgentId) : null;

  return (
    <DriftContext.Provider
      value={{
        // Data
        campus,
        agents,
        loading,
        error,

        // Active chat
        activeAgentId,
        activeAgent,
        chatOpen,
        openChat,
        closeChat,

        // User
        userLocation,
        setUserLocation,

        // Proximity
        proximityData,
        setProximity,
        clearProximity,
        waveData,
        showWave,
        dismissWave,

        // Gossip
        gossipToasts,
        addGossipToast,

        // Agent updates
        updateAgentState,
        getAgent,
      }}
    >
      {children}
    </DriftContext.Provider>
  );
}
