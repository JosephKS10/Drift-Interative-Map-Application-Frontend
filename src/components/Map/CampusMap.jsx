import { useCallback, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { useDrift } from "../../context/DriftContext";
import AgentMarker from "./AgentMarker";
import UserDot from "./UserDot";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

/* ── Agent Card (top-left) ───────────── */
function AgentCard({ agent, proximity, onClose }) {
  if (!agent) return null;

  const proximityLabel =
    proximity === "near" ? "Nearby" : proximity === "mid" ? "Close" : "Far away";
  const proximityColor =
    proximity === "near" ? "#34d399" : proximity === "mid" ? "#fbbf24" : "#94a3b8";

  return (
    <div
      className="w-[260px] rounded-[20px] overflow-hidden border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)] animate-cardIn"
      style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-xl shrink-0 border border-white/[0.12]"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            {agent.avatar || agent.name?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white/90 tracking-tight truncate">{agent.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium" style={{ color: proximityColor }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: proximityColor }} />
              {proximityLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] text-white/40 border border-white/[0.08] shrink-0 cursor-pointer transition-all duration-150 hover:text-red-400/90"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >✕</button>
        </div>

        {agent.bio && (
          <p className="text-xs text-white/45 leading-relaxed mt-2.5 line-clamp-2">{agent.bio}</p>
        )}

        <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
          <img
            src="https://res.cloudinary.com/dehtc9uyy/image/upload/v1773484432/agent_qldtss.png"
            alt={agent.name}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 py-1.5 rounded-xl text-xs font-medium text-white/88 border border-white/10 cursor-pointer transition-all duration-150 hover:bg-white/16"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            👋 Wave
          </button>
          <button
            className="flex-1 py-1.5 rounded-xl text-xs font-medium text-white/45 border border-white/[0.07] cursor-pointer transition-all duration-150 hover:bg-white/[0.06] hover:text-white/70"
            style={{ background: "transparent" }}
            onClick={() => window.open(`https://www.google.com/maps?q=${agent.location.lat},${agent.location.lng}`, "_blank")}
          >🗺 Maps</button>
        </div>
      </div>
    </div>
  );
}

/* ── Event Card (bottom of agent) ────── */
function EventCard({ agent }) {
  if (!agent) return null;

  return (
    <div
      className="w-[260px] rounded-[20px] overflow-hidden border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)] animate-cardIn [animation-delay:0.08s]"
      style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
    >
      <div className="relative overflow-hidden h-[120px]">
        <img
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80"
          alt="Event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-0.5">Tonight</div>
          <div className="text-sm font-bold text-white leading-tight truncate">
            {agent.eventName || "Event Details"}
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span>📍</span>
            <span className="truncate">{agent.location?.building || "Unknown venue"}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span>🕕</span>
            <span>{agent.startTime || "6:00 PM"} – {agent.endTime || "11:00 PM"}</span>
          </div>
        </div>
        <button
          className="w-full mt-2.5 py-1.5 rounded-xl text-xs font-medium text-white/70 border border-white/[0.07] cursor-pointer transition-all duration-150 hover:bg-white/[0.08] hover:text-white/90"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >🎟 Get Tickets</button>
      </div>
    </div>
  );
}

/* ── Response Photos + Nearby (right column) */
function SuggestionsPanel() {
  const [nearbyIdx, setNearbyIdx] = useState(0);
  const [hoveredPlace, setHoveredPlace] = useState(null);

  const responsePlaces = [
    {
      id: 1,
      name: "Footscray Market",
      rating: 4.2,
      ratingCount: 5200,
      address: "Irving St, Footscray VIC 3011",
      distance: 275,
      isOpen: true,
      photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
    },
    {
      id: 2,
      name: "Laksa King",
      rating: 4.5,
      ratingCount: 3100,
      address: "47 Paisley St, Footscray VIC 3011",
      distance: 2989,
      isOpen: true,
      photoUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80"
    },
  ];

  const nearbyPlaces = [
    { id: 1, name: "Heavenly Queen Temple", rating: 4.7, distance: 1339, isOpen: null, photoUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80" },
    { id: 2, name: "Footscray Park", rating: 4.6, distance: 800, isOpen: true, photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
    { id: 3, name: "Reverence Hotel", rating: 4.3, distance: 450, isOpen: true, photoUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80" },
    { id: 4, name: "Cafe Racer", rating: 4.4, distance: 620, isOpen: true, photoUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80" },
    { id: 5, name: "Little Saigon", rating: 4.5, distance: 340, isOpen: false, photoUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80" },
    { id: 6, name: "Reverence Hotel", rating: 4.3, distance: 900, isOpen: true, photoUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80" },
  ];

  const visibleCount = 3;
  const canPrev = nearbyIdx > 0;
  const canNext = nearbyIdx + visibleCount < nearbyPlaces.length;

  const formatDist = (m) => m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
  const mapsUrl = (address) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  
  return (
    <div className="flex flex-col gap-3 animate-cardIn [animation-delay:0.06s]">

      {/* Response photo cards — side by side */}
      <div className="flex gap-3">
        {responsePlaces.map((place) => (
          <div
            key={place.id}
            className="relative w-[200px] h-[260px] rounded-[20px] overflow-hidden cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/[0.08]"
            style={{ transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
            onMouseEnter={(e) => {
              setHoveredPlace(place.id);
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              setHoveredPlace(null);
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
          >
            {/* Photo */}
            <img
              src={place.photoUrl}
              alt={place.name}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: hoveredPlace === place.id ? "scale(1.08)" : "scale(1)" }}
            />

            {/* Gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

            {/* Open badge — top left */}
            {place.isOpen !== null && (
              <div
                className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${place.isOpen ? "bg-emerald-400" : "bg-white/30"}`}
                  style={{ boxShadow: place.isOpen ? "0 0 6px #34d399" : "none" }}
                />
                <span className="text-[9px] font-semibold text-white/80">{place.isOpen ? "Open" : "Closed"}</span>
              </div>
            )}

            {/* Distance badge — top right */}
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/70"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {formatDist(place.distance)}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-[13px] font-bold text-white leading-tight mb-1.5 drop-shadow-md">
                {place.name}
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-amber-400 text-[11px]">★</span>
                <span className="text-[11px] font-semibold text-white/80">{place.rating}</span>
                <span className="text-[10px] text-white/35">({(place.ratingCount / 1000).toFixed(1)}k)</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 mb-3">
                <span className="text-[10px] text-white/40 mt-0.5">📍</span>
                <span className="text-[10px] text-white/45 leading-tight line-clamp-2">{place.address}</span>
              </div>

              {/* Directions button — slides up on hover */}
              <div
                className="transition-all duration-300"
                style={{
                  transform: hoveredPlace === place.id ? "translateY(0)" : "translateY(6px)",
                  opacity: hoveredPlace === place.id ? 1 : 0,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(mapsUrl(place.address), "_blank");
                  }}
                  className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Directions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nearby places horizontal slider */}
      <div
        className="rounded-[20px] border border-white/[0.09] backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        style={{ background: "rgba(15,15,20,0.65)", backdropFilter: "blur(90px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
      >
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">Nearby</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setNearbyIdx(i => Math.max(0, i - visibleCount))}
              disabled={!canPrev}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${canPrev ? "text-white/60 hover:text-white" : "text-white/15 cursor-default"}`}
              style={{ background: "rgba(255,255,255,0.07)" }}
            >‹</button>
            <button
              onClick={() => setNearbyIdx(i => Math.min(nearbyPlaces.length - visibleCount, i + visibleCount))}
              disabled={!canNext}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${canNext ? "text-white/60 hover:text-white" : "text-white/15 cursor-default"}`}
              style={{ background: "rgba(255,255,255,0.07)" }}
            >›</button>
          </div>
        </div>

        <div className="flex gap-2.5 px-4 pb-4">
          {nearbyPlaces.slice(nearbyIdx, nearbyIdx + visibleCount).map((place) => (
            <div
              key={place.id}
              className="shrink-0 w-[122px] rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="relative h-[80px] overflow-hidden">
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {place.isOpen !== null && (
                  <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${place.isOpen ? "bg-emerald-400" : "bg-white/30"}`} />
                )}
                <div className="absolute bottom-1.5 left-2 text-[9px] font-medium text-white/60">
                  {place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
                </div>
              </div>
              <div className="p-2">
                <div className="text-[11px] font-semibold text-white/80 leading-tight line-clamp-2 mb-1">{place.name}</div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 text-[9px]">★</span>
                  <span className="text-[9px] text-white/50">{place.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── Main ────────────────────────────── */
export default function CampusMap({ onAgentClick }) {
  const { campus, agents, userLocation, proximityData, chatOpen, openChat, closeChat, activeAgent } = useDrift();

  const [viewState, setViewState] = useState({
    latitude: campus?.center?.lat || -37.8136,
    longitude: campus?.center?.lng || 144.9631,
    zoom: campus?.defaultZoom || 15,
    pitch: 30,
  });

  const handleAgentClick = useCallback((agentId) => {
    openChat(agentId);
    if (onAgentClick) onAgentClick(agentId);
  }, [openChat, onAgentClick]);

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={campus?.mapboxStyle || "mapbox://styles/mapbox/dark-v11"}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {agents.map((agent) => (
          <Marker key={agent.id} latitude={agent.location.lat} longitude={agent.location.lng} anchor="center">
            <AgentMarker agent={agent} proximity={proximityData[agent.id]} onClick={() => handleAgentClick(agent.id)} />
          </Marker>
        ))}

        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <UserDot />
          </Marker>
        )}
      </Map>

      {chatOpen && activeAgent && (
        <div className="absolute top-14 left-5 z-30 flex flex-row items-start gap-3 pointer-events-none">

          {/* Left column: Agent card on top, Event card below */}
          <div className="pointer-events-auto flex flex-col gap-3">
            <AgentCard agent={activeAgent} proximity={proximityData[activeAgent.id]} onClose={closeChat} />
            <EventCard agent={activeAgent} />
          </div>

          {/* Right column: Response photos + nearby slider */}
          <div className="pointer-events-auto">
            <SuggestionsPanel />
          </div>

        </div>
      )}

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-cardIn {
          animation: cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both;
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}