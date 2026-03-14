/**
 * REST API service.
 *
 * In dev, Vite proxies /api to localhost:3001.
 * In production, set VITE_API_URL to the Railway backend URL.
 */

const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Campus & Agents ──────────────────────────────

export function fetchCampus(campusId = "clayton") {
  return request(`/api/campus/${campusId}`);
}

export function fetchAgents() {
  return request("/api/agents");
}

export function fetchEvents() {
  return request("/api/events");
}

export function fetchAgentProfile(agentId) {
  return request(`/api/agents/${agentId}/profile`);
}

export function fetchAgentMemories(agentId, userId) {
  return request(`/api/agents/${agentId}/memories`, {
    headers: userId ? { "x-user-id": userId } : {},
  });
}

// ── Chat (REST fallback — prefer WebSocket) ──────

export function chatWithAgent(agentId, message, userLocation, userId) {
  return request(`/api/agents/${agentId}/chat`, {
    method: "POST",
    headers: userId ? { "x-user-id": userId } : {},
    body: JSON.stringify({ message, userLocation }),
  });
}

// ── Places & Stats ───────────────────────────────

export function fetchPlaces() {
  return request("/api/places");
}

export function fetchStats() {
  return request("/api/stats");
}

export function healthCheck() {
  return request("/health");
}
