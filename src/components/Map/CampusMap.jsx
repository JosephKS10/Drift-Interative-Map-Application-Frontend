import { useCallback, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { useDrift } from "../../context/DriftContext";
import AgentMarker from "./AgentMarker";
import UserDot from "./UserDot";

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

/* ─────────────────────────────
   AGENT PANEL
───────────────────────────── */

function AgentPanel({ agent, proximity }) {
  if (!agent) return null;

  const statusColor =
    proximity === "near"
      ? "bg-green-400"
      : proximity === "mid"
      ? "bg-yellow-400"
      : "bg-slate-400";

  return (
    <div className="h-full flex flex-col p-5 text-white space-y-4">

      <div className="text-xl font-semibold">
        {agent.name}
      </div>

      {agent.avatarUrl && (
        <img
          src={agent.avatarUrl}
          className="rounded-xl w-full h-40 object-cover"
        />
      )}

      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        {proximity || "Far Away"}
      </div>

      <p className="text-sm opacity-80">
        {agent.bio || "Agent information will appear here"}
      </p>

      <button className="py-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
        Wave 👋
      </button>

      <button className="py-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition">
        Profile
      </button>

      <button
        onClick={() => {
          const url = `https://www.google.com/maps?q=${agent.location.lat},${agent.location.lng}`;
          window.open(url, "_blank");
        }}
        className="py-2 bg-blue-500 rounded-xl hover:bg-blue-600 transition"
      >
        Go to Maps
      </button>

    </div>
  );
}

/* ─────────────────────────────
   EVENT PANEL
───────────────────────────── */

function EventPanel({ agent }) {
  if (!agent) return null;

  return (
    <div className="h-full p-6 text-white overflow-y-auto custom-scroll">

      <h2 className="text-xl font-semibold mb-4">
        {agent.eventName || "Event Details"}
      </h2>

      <div className="mb-6">
        <h3 className="text-sm opacity-60 mb-2">
          Description
        </h3>

        <p className="opacity-80 text-sm leading-relaxed">
          {agent.eventDescription ||
            agent.bio ||
            "This event brings together music, food, and people from across the city."}
        </p>
      </div>

      <div className="space-y-3 text-sm">

        <h3 className="text-sm opacity-60">
          Schedule
        </h3>

        <div>
          <span className="opacity-60">Location:</span>
          <span className="ml-2">
            {agent.location?.building || "Unknown"}
          </span>
        </div>

        <div>
          <span className="opacity-60">Start:</span>
          <span className="ml-2">
            {agent.startTime || "6:00 PM"}
          </span>
        </div>

        <div>
          <span className="opacity-60">End:</span>
          <span className="ml-2">
            {agent.endTime || "11:00 PM"}
          </span>
        </div>

      </div>

    </div>
  );
}

/* ─────────────────────────────
   REEL PANEL
───────────────────────────── */

function ReelPanel() {

  const reels = [
    {
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
      caption: "Crowd going crazy 🔥",
      likes: 340,
      comments: 25,
      user: "DJ Pulse"
    },
    {
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      caption: "Live DJ set 🎧",
      likes: 420,
      comments: 60,
      user: "ClubCam"
    },
    {
      image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
      caption: "Night vibes 🌃",
      likes: 190,
      comments: 14,
      user: "NightLife"
    },
  ];

  const [index, setIndex] = useState(0);

  const nextReel = () => {
    setIndex((prev) => (prev + 1) % reels.length);
  };

  const prevReel = () => {
    setIndex((prev) =>
      prev === 0 ? reels.length - 1 : prev - 1
    );
  };

  const reel = reels[index];

  return (
    <div className="h-full flex flex-col p-4 text-white">

      <h3 className="font-semibold mb-3">
        Event Reels
      </h3>

      <div className="relative rounded-2xl overflow-hidden bg-black">

        <img
          src={reel.image}
          className="w-full h-[340px] object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">

          <div className="text-sm font-semibold">
            {reel.user}
          </div>

          <div className="text-sm opacity-80 mb-2">
            {reel.caption}
          </div>

          <div className="flex gap-4 text-sm opacity-90">
            <div>❤️ {reel.likes}</div>
            <div>💬 {reel.comments}</div>
          </div>

        </div>

      </div>

      <div className="flex justify-between mt-4">

        <button
          onClick={prevReel}
          className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
        >
          ↑ Previous
        </button>

        <button
          onClick={nextReel}
          className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
        >
          Next ↓
        </button>

      </div>

    </div>
  );
}

/* ─────────────────────────────
   MAIN MAP
───────────────────────────── */

export default function CampusMap({ onAgentClick }) {

  const {
    campus,
    agents,
    userLocation,
    proximityData,
    chatOpen,
    openChat,
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

      openChat(agentId);

      if (onAgentClick) onAgentClick(agentId);

    },
    [openChat, onAgentClick]
  );

  return (
    <div className="relative w-full h-full">

      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={campus?.mapboxStyle || "mapbox://styles/mapbox/dark-v11"}
        style={{ width: "100%", height: "100%" }}
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
          <Marker
            latitude={userLocation.lat}
            longitude={userLocation.lng}
            anchor="center"
          >
            <UserDot />
          </Marker>
        )}

      </Map>

      {/* PANELS */}

      {chatOpen && activeAgent && (
        <div className="absolute top-6 bottom-6 left-6 flex gap-6 pointer-events-none">

          <div className="pointer-events-auto w-[260px] rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden panel-slide">
            <AgentPanel
              agent={activeAgent}
              proximity={proximityData[activeAgent.id]}
            />
          </div>

          <div className="pointer-events-auto w-[320px] rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden panel-slide delay-100">
            <EventPanel agent={activeAgent} />
          </div>

          <div className="pointer-events-auto w-[300px] rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden panel-slide delay-200">
            <ReelPanel />
          </div>

          <button
            onClick={closeChat}
            className="
              pointer-events-auto
              absolute
              right-[-70px]
              top-1/2
              -translate-y-1/2
              w-14
              h-14
              rounded-full
              bg-red-500
              text-white
              text-2xl
              font-bold
              shadow-xl
              hover:scale-110
              hover:bg-red-600
              transition
              flex
              items-center
              justify-center
            "
          >
            ✕
          </button>

        </div>
      )}

      <style jsx global>{`

      .panel-slide {
        animation: slideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        will-change: transform, opacity;
      }

      .delay-100 { animation-delay: 0.06s }
      .delay-200 { animation-delay: 0.12s }

      @keyframes slideIn {
        from {
          opacity:0;
          transform:translate3d(-30px,0,0);
        }
        to {
          opacity:1;
          transform:translate3d(0,0,0);
        }
      }

      .custom-scroll::-webkit-scrollbar {
        width:6px;
      }

      .custom-scroll::-webkit-scrollbar-track {
        background:transparent;
      }

      .custom-scroll::-webkit-scrollbar-thumb {
        background:rgba(255,255,255,0.25);
        border-radius:10px;
      }

      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background:rgba(255,255,255,0.4);
      }

      `}</style>

    </div>
  );
}