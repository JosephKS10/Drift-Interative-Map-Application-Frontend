import { useCallback, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { useDrift } from "../../context/DriftContext";
import AgentMarker from "./AgentMarker";
import UserDot from "./UserDot";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

// ── Agent Detail Card ──────────────────────────────────────────────────────
function AgentCard({ agent, proximity, onClose }) {
  if (!agent) return null;

  const statusColor =
    proximity === "near" ? "bg-green-400" :
    proximity === "mid"  ? "bg-yellow-400" : "bg-slate-300";

  const statusLabel =
    proximity === "near" ? "Nearby" :
    proximity === "mid"  ? "In range" : "Far away";

  return (
    <div
      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-72"
      style={{
        animation: "slideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1) both",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-18px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>

      <div
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
      >
        {/* ── Hero photo ── */}
        <div className="relative h-44 w-full bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
          {agent.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Fallback avatar initials */
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-light text-slate-400 select-none">
                {agent.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center
              bg-black/20 backdrop-blur-md text-white/90 hover:bg-black/35 transition-colors"
            style={{ fontSize: 14, lineHeight: 1 }}
          >
            ✕
          </button>

          {/* Status pill over image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5
            bg-black/25 backdrop-blur-md rounded-full px-2.5 py-1">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor} shadow-sm`} />
            <span className="text-[10px] font-medium text-white/90 tracking-wide">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          {/* Name & handle */}
          <div>
            <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-tight">
              {agent.name || "Unknown"}
            </h2>
            {agent.handle && (
              <p className="text-[12px] text-slate-400 mt-0.5 tracking-wide">
                @{agent.handle}
              </p>
            )}
          </div>

          {/* Bio */}
          {agent.bio && (
            <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
              {agent.bio}
            </p>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5">
            {agent.faculty && (
              <span className="text-[11px] font-medium text-slate-600
                bg-slate-100/80 rounded-full px-2.5 py-1 border border-slate-200/60">
                {agent.faculty}
              </span>
            )}
            {agent.year && (
              <span className="text-[11px] font-medium text-slate-600
                bg-slate-100/80 rounded-full px-2.5 py-1 border border-slate-200/60">
                Year {agent.year}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button className="flex-1 py-2.5 rounded-2xl text-[13px] font-semibold
              bg-slate-900 text-white hover:bg-slate-700 active:scale-[0.97]
              transition-all duration-150">
              Wave 👋
            </button>
            <button className="flex-1 py-2.5 rounded-2xl text-[13px] font-semibold
              bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 active:scale-[0.97]
              border border-slate-200/60 transition-all duration-150">
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Map ───────────────────────────────────────────────────────────────
export default function CampusMap({ onAgentClick, onMapClick }) {
  const { campus, agents, userLocation, proximityData } = useDrift();

  const [viewState, setViewState] = useState({
    latitude:  campus?.center?.lat  || -37.9106,
    longitude: campus?.center?.lng  || 145.1365,
    zoom:      campus?.defaultZoom  || 16,
    pitch: 30,
  });

  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleAgentClick = useCallback((agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    setSelectedAgent(agent || null);
    if (onAgentClick) onAgentClick(agentId);
  }, [agents, onAgentClick]);

  const handleMapClick = useCallback((e) => {
    setSelectedAgent(null);
    if (onMapClick) onMapClick(e.lngLat.lat, e.lngLat.lng);
  }, [onMapClick]);

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onClick={handleMapClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={campus?.mapboxStyle || "mapbox://styles/mapbox/dark-v11"}
        style={{ width: "100%", height: "100%" }}
        maxBounds={
          campus?.bounds
            ? [[campus.bounds.west, campus.bounds.south],[campus.bounds.east, campus.bounds.north]]
            : undefined
        }
        minZoom={14}
        maxZoom={19}
      >
        <NavigationControl position="top-left" showCompass={false} />

        {agents.map((agent) => (
          <Marker
            key={agent.id}
            latitude={agent.location.lat}
            longitude={agent.location.lng}
            anchor="center"
          >
            <AgentMarker
              agent={agent}
              proximity={proximityData[agent.id]}
              onClick={() => handleAgentClick(agent.id)}
            />
          </Marker>
        ))}

        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <UserDot />
          </Marker>
        )}
      </Map>

      {/* Agent detail card */}
      {selectedAgent && (
        <AgentCard
          key={selectedAgent.id}
          agent={selectedAgent}
          proximity={proximityData[selectedAgent.id]}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}