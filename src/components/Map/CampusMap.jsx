import { useCallback, useState, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { useDrift } from "../../context/DriftContext";
import AgentMarker from "./AgentMarker";
import UserDot from "./UserDot";
import { fetchEvents } from "../../services/api";
import AgentAvatar from "../Agent/AgentAvatar";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

/* ── Agent Card (top-left) ───────────── */
function AgentCard({ agent, proximity, onClose }) {
  if (!agent) return null;

  const proximityZone = proximity?.zone;
  const proximityDistance = proximity?.distance;

  const statusColor =
    proximityZone === "intimate"
      ? "bg-green-400"
      : proximityZone === "nearby" || proximityZone === "vicinity"
      ? "bg-yellow-400"
      : "bg-slate-400";

  const proximityColor =
    proximityZone === "intimate"
      ? "#4ade80"
      : proximityZone === "nearby" || proximityZone === "vicinity"
      ? "#facc15"
      : "#94a3b8";

  const proximityLabel = proximityZone
    ? `${proximityZone}${typeof proximityDistance === "number" ? ` · ${Math.round(proximityDistance)}m` : ""}`
    : "Far Away";

  return (
    <div
      className="w-[260px] rounded-[20px] overflow-hidden border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)] animate-cardIn"
      style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)" }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-xl shrink-0 border border-white/[0.12]"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            <AgentAvatar
              agentId={agent.id}
              avatar={agent.avatar || agent.name?.[0] || "?"}
              zone={proximityZone}
              scale={1.9}
              offsetY="-18%"
            />
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

      <div
        className="mt-3 h-60 rounded-xl border border-white/[0.08] overflow-hidden flex items-center justify-center"
        style={{ background: "radial-gradient(circle at top, rgba(255,255,255,0.08), rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.01) 100%)" }}
      >
        <div className="w-80 h-60">
          <AgentAvatar
            agentId={agent.id}
            avatar={agent.avatar || agent.name?.[0] || "?"}
            zone={proximityZone}
            scale={3}
            offsetY="-25%"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        {proximityZone
          ? `${proximityZone}${typeof proximityDistance === "number" ? ` · ${Math.round(proximityDistance)}m` : ""}`
          : "Far Away"}
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
  const [events, setEvents] = useState([]);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch events once on mount
  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter events within 5km of the active agent
  useEffect(() => {
    if (!agent || events.length === 0) {
      setNearbyEvents([]);
      return;
    }

    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const filtered = events
      .filter((evt) => evt.location?.lat && evt.location?.lng)
      .map((evt) => ({
        ...evt,
        distance: Math.round(
          haversine(
            agent.location.lat, agent.location.lng,
            evt.location.lat, evt.location.lng
          )
        ),
      }))
      .filter((evt) => evt.distance <= 5000)
      .sort((a, b) => a.distance - b.distance);

    setNearbyEvents(filtered);
    setCurrentIdx(0);
  }, [agent, events]);

  if (!agent) return null;

  if (loading) {
    return (
      <div
        className="w-[260px] rounded-[20px] overflow-hidden border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)" }}
      >
        <div className="p-4 text-center">
          <div className="text-[11px] text-white/30">Loading events...</div>
        </div>
      </div>
    );
  }

  if (nearbyEvents.length === 0) {
    return (
      <div
        className="w-[260px] rounded-[20px] overflow-hidden border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)] animate-cardIn [animation-delay:0.08s]"
        style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)" }}
      >
        <div className="p-4 text-center">
          <div className="text-lg mb-1.5">📍</div>
          <div className="text-[11px] text-white/40">No events nearby</div>
          <div className="text-[9px] text-white/20 mt-1">
            No events within 5km of {agent.name.split(" ")[0]}
          </div>
        </div>
      </div>
    );
  }

  const event = nearbyEvents[currentIdx];
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < nearbyEvents.length - 1;
  const formatDist = (m) => m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;

  // Pick a category icon
  const categoryIcon = {
    tech: "💻", food: "🍽️", community: "🎉", markets: "🛍️",
    arts: "🎨", sports: "🏟️", music: "🎵", nature: "🌿",
    nightlife: "🌙", free: "🎟️",
  }[event.category] || "📅";

  return (
    <div
      className="w-[260px] rounded-[20px] overflow-hidden border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)] animate-cardIn [animation-delay:0.08s]"
      style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)" }}
    >
      {/* Header with navigation */}
      <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">
            Events nearby
          </span>
          <span className="text-[9px] text-white/20 ml-1">
            {currentIdx + 1}/{nearbyEvents.length}
          </span>
        </div>
        {nearbyEvents.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentIdx((i) => i - 1)}
              disabled={!canPrev}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                canPrev ? "text-white/60 hover:text-white cursor-pointer" : "text-white/15 cursor-default"
              }`}
              style={{ background: "rgba(255,255,255,0.07)" }}
            >‹</button>
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              disabled={!canNext}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                canNext ? "text-white/60 hover:text-white cursor-pointer" : "text-white/15 cursor-default"
              }`}
              style={{ background: "rgba(255,255,255,0.07)" }}
            >›</button>
          </div>
        )}
      </div>

      {/* Event content */}
      <div className="px-4 pb-3.5">
        {/* Title row */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white/90 leading-tight line-clamp-2">
              {event.title}
            </div>
            {event.category && (
              <span
                className="inline-block mt-1 text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
              >
                {event.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-white/40 leading-relaxed mb-3 line-clamp-3">
          {event.description}
        </p>

        {/* Details */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className="w-4 text-center">📍</span>
            <span className="truncate">{event.location?.name || "Melbourne"}</span>
            <span className="text-white/20 ml-auto shrink-0">{formatDist(event.distance)}</span>
          </div>
          {event.date && (
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <span className="w-4 text-center">📅</span>
              <span className="truncate">{event.date}</span>
            </div>
          )}
          {event.time && event.time !== "Varies" && (
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <span className="w-4 text-center">🕕</span>
              <span>{event.time}</span>
            </div>
          )}
        </div>

        {/* Directions button */}
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`,
              "_blank"
            )
          }
          className="w-full py-1.5 rounded-xl text-[11px] font-medium text-white/70 border border-white/[0.07] cursor-pointer transition-all duration-150 hover:bg-white/[0.08] hover:text-white/90 flex items-center justify-center gap-1.5"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Get Directions
        </button>
      </div>
    </div>
  );
}

/* ── Response Photos + Nearby (right column) */
function SuggestionsPanel({ placesData, isTyping }) {
  const [nearbyIdx, setNearbyIdx] = useState(0);
  const [hoveredPlace, setHoveredPlace] = useState(null);

  const placeCards = placesData?.placeCards || [];
  const nearbyPlaces = placesData?.nearbyPlaces || [];
  const loading = placesData?.loading || false;

  const hasAnyData = placeCards.length > 0 || nearbyPlaces.length > 0;

  // Reset nearby scroll when data changes
  useEffect(() => {
    setNearbyIdx(0);
  }, [nearbyPlaces.length]);

  // Show loader while typing/loading
  if (isTyping || loading) {
    return (
      <div className="flex flex-col gap-3 animate-cardIn">
        <div
          className="w-[420px] h-[260px] rounded-[20px] border border-white/[0.09] shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex items-center justify-center"
          style={{ background: "rgba(15,15,20,0.55)", backdropFilter: "blur(24px) saturate(180%)" }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/20"
                  style={{ animation: `breathe 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <div className="text-[11px] text-white/30">Finding places...</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if no data
  if (!hasAnyData) return null;

  const visibleCount = 3;
  const canPrev = nearbyIdx > 0;
  const canNext = nearbyIdx + visibleCount < nearbyPlaces.length;
  const formatDist = (m) => m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
  const mapsUrl = (place) => {
    if (place.address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
    if (place.lat && place.lng) return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    return "#";
  };

  const fallbackPhoto = (type) => {
    const gradients = {
      cafe: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
      restaurant: "linear-gradient(135deg, #9a3412 0%, #7c2d12 100%)",
      other: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)",
      library: "linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)",
      gym: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
      shop: "linear-gradient(135deg, #7c2d12 0%, #451a03 100%)",
    };
    return gradients[type] || gradients.other;
  };

  const typeIcon = (type) => {
    const icons = { cafe: "☕", restaurant: "🍽️", library: "📚", gym: "💪", shop: "🛍️", other: "📍" };
    return icons[type] || "📍";
  };

  return (
    <div className="flex flex-col gap-3 animate-cardIn [animation-delay:0.06s]">
      {/* Mentioned place cards — side by side */}
      {placeCards.length > 0 && (
        <div className="flex gap-3">
          {placeCards.slice(0, 3).map((place) => (
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
              {/* Photo or fallback */}
              {place.photoUrl ? (
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: hoveredPlace === place.id ? "scale(1.08)" : "scale(1)" }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl"
                  style={{ background: fallbackPhoto(place.type) }}
                >
                  {typeIcon(place.type)}
                </div>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

              {/* Open badge */}
              {place.isOpen !== null && place.isOpen !== undefined && (
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

              {/* Distance badge */}
              {place.distance && (
                <div
                  className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white/70"
                  style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {formatDist(place.distance)}
                </div>
              )}

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-[13px] font-bold text-white leading-tight mb-1.5 drop-shadow-md">
                  {place.name}
                </div>
                {place.rating && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-amber-400 text-[11px]">★</span>
                    <span className="text-[11px] font-semibold text-white/80">{place.rating}</span>
                    {place.ratingCount && (
                      <span className="text-[10px] text-white/35">
                        ({place.ratingCount >= 1000 ? `${(place.ratingCount / 1000).toFixed(1)}k` : place.ratingCount})
                      </span>
                    )}
                  </div>
                )}
                {place.address && (
                  <div className="flex items-start gap-1.5 mb-3">
                    <span className="text-[10px] text-white/40 mt-0.5">📍</span>
                    <span className="text-[10px] text-white/45 leading-tight line-clamp-2">{place.address}</span>
                  </div>
                )}
                {place.insiderTip && (
                  <div className="flex items-start gap-1.5 mb-3">
                    <span className="text-[10px] text-white/40 mt-0.5">💡</span>
                    <span className="text-[10px] text-amber-300/60 leading-tight line-clamp-2 italic">{place.insiderTip}</span>
                  </div>
                )}
                {/* Directions button on hover */}
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
                      window.open(mapsUrl(place), "_blank");
                    }}
                    className="w-full py-1.5 rounded-xl text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
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
      )}

      {/* Nearby places horizontal slider */}
      {nearbyPlaces.length > 0 && (
        <div
          className="rounded-[20px] border border-white/[0.09] backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          style={{ background: "rgba(15,15,20,0.65)", backdropFilter: "blur(90px) saturate(180%)" }}
        >
          <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">More places nearby</span>
            </div>
            {nearbyPlaces.length > visibleCount && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => setNearbyIdx((i) => Math.max(0, i - visibleCount))}
                  disabled={!canPrev}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${canPrev ? "text-white/60 hover:text-white" : "text-white/15 cursor-default"}`}
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >‹</button>
                <button
                  onClick={() => setNearbyIdx((i) => Math.min(nearbyPlaces.length - visibleCount, i + visibleCount))}
                  disabled={!canNext}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${canNext ? "text-white/60 hover:text-white" : "text-white/15 cursor-default"}`}
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >›</button>
              </div>
            )}
          </div>
          <div className="flex gap-2.5 px-4 pb-4">
            {nearbyPlaces.slice(nearbyIdx, nearbyIdx + visibleCount).map((place) => (
              <div
                key={place.id}
                className="shrink-0 w-[122px] rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-[1.03]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                onClick={() => {
                  const url = mapsUrl(place);
                  if (url !== "#") window.open(url, "_blank");
                }}
              >
                <div className="relative h-[80px] overflow-hidden">
                  {place.photoUrl ? (
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ background: fallbackPhoto(place.type) }}
                    >
                      {typeIcon(place.type)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {place.isOpen !== null && place.isOpen !== undefined && (
                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${place.isOpen ? "bg-emerald-400" : "bg-white/30"}`} />
                  )}
                  <div className="absolute bottom-1.5 left-2 text-[9px] font-medium text-white/60">
                    {place.distance ? formatDist(place.distance) : ""}
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[11px] font-semibold text-white/80 leading-tight line-clamp-2 mb-1">{place.name}</div>
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-[9px]">★</span>
                      <span className="text-[9px] text-white/50">{place.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────
   MAIN MAP
───────────────────────────── */

export default function CampusMap({ onAgentClick, onMapClick, placesData, isTyping }) {

  const {
    campus,
    agents,
    userLocation,
    proximityData,
    chatOpen,
    closeChat,
    activeAgent
  } = useDrift();

  const [viewState, setViewState] = useState({
    latitude: campus?.center?.lat || -37.8136,
    longitude: campus?.center?.lng || 144.9631,
    zoom: campus?.defaultZoom || 15,
    pitch: 30,
  });

  const handleAgentClick = useCallback(
    (agentId) => {
      if (onAgentClick) onAgentClick(agentId);
    },
    [onAgentClick]
  );

  const handleMapClick = useCallback(
    (event) => {
      if (!onMapClick) return;

      const { lat, lng } = event.lngLat;
      onMapClick(lat, lng);
    },
    [onMapClick]
  );

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onClick={handleMapClick} 
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={campus?.mapboxStyle || "mapbox://styles/mapbox/dark-v11"}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {agents.map((agent) => (
          <Marker key={agent.id} latitude={agent.location.lat} longitude={agent.location.lng} anchor="center">
            <AgentMarker
              agent={agent}
              proximity={proximityData[agent.id]}
              zoom={viewState.zoom}
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

      {chatOpen && activeAgent && (
        <div className="absolute top-14 left-5 z-30 flex flex-row items-start gap-3 pointer-events-none">

          {/* Left column: Agent card on top, Event card below */}
          <div className="pointer-events-auto flex flex-col gap-3">
            <AgentCard agent={activeAgent} proximity={proximityData[activeAgent.id]} onClose={closeChat} />
            <EventCard agent={activeAgent} />
          </div>

          {/* Right column: Response photos + nearby slider */}
          <div className="pointer-events-auto">
            <SuggestionsPanel placesData={placesData} isTyping={isTyping} />
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
