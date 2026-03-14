import { useState, useMemo } from "react";
import { useDrift } from "../../context/DriftContext";
import { useChat } from "../../hooks/useChat";
import { useProximity } from "../../hooks/useProximity";
import CampusMap from "../Map/CampusMap";
import ChatPanel from "../Chat/ChatPanel";
import AgentCard from "../Agent/AgentCard";
import GossipToast from "../Map/GossipToast";
import WaveBubble from "../Map/WaveBubble";

export default function AppShell({ socketRef }) {

  const {
    agents,
    campus,
    chatOpen,
    activeAgentId,
    openChat,
    closeChat,
    waveData,
    dismissWave,
    gossipToasts,
  } = useDrift();

  const chat = useChat(socketRef);
  const { moveUser } = useProximity(socketRef);

  const [activeCategory, setActiveCategory] = useState("events");

  /*
  Randomly assign agents to categories once
  */
  const agentCategoryMap = useMemo(() => {

    const categories = ["events","food","nature","life","deals"];

    const shuffled = [...agents].sort(() => Math.random() - 0.5);

    const map = {};

    shuffled.forEach((agent, i) => {

      const category = categories[i % categories.length];

      map[agent.id] = category;

    });

    return map;

  }, [agents]);

  /*
  Filter agents based on selected category
  */
  const filteredAgents = useMemo(() => {

    const categoryKey =
      activeCategory === "events" ? "events" :
      activeCategory === "food" ? "food" :
      activeCategory === "nature" ? "nature" :
      activeCategory === "life" ? "life" :
      "deals";

    const filtered = agents.filter(
      agent => agentCategoryMap[agent.id] === categoryKey
    );

    return filtered.slice(0,8);

  }, [agents, activeCategory, agentCategoryMap]);


  return (
  <div className="h-screen w-screen relative overflow-hidden">

    {/* ── Map ── */}
    <div className="absolute inset-0 z-0">
      <CampusMap
        filteredAgents={filteredAgents}
        onAgentClick={openChat}
        onMapClick={moveUser}
        socketRef={socketRef}
        placesData={activeAgentId ? chat.getPlacesData(activeAgentId) : null}
        isTyping={chat.typing}
      />
    </div>


    {/* ── Header ── */}
    <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-b border-slate-800/50 backdrop-blur-sm z-20">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          DRIFT
        </span>
        <span className="text-[10px] text-slate-600 tracking-widest">
          {campus?.name || "Campus"}
        </span>
      </div>

      <div className="text-[10px] text-slate-700">
        {filteredAgents.length} neighbors online
      </div>
    </header>


    {/* ── Category Buttons ── */}
    <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-1.5">

<div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">

  <button
  onClick={()=>setActiveCategory("events")}
  className="py-1.5 px-2.5 text-sm rounded-lg bg-gray-100 dark:bg-neutral-700">
    Events
  </button>

  <button
  onClick={()=>setActiveCategory("food")}
  className="py-1.5 px-2.5 text-sm rounded-lg bg-gray-100 dark:bg-neutral-700">
    Food Spots
  </button>

  <button
  onClick={()=>setActiveCategory("nature")}
  className="py-1.5 px-2.5 text-sm rounded-lg bg-gray-100 dark:bg-neutral-700">
    Nature
  </button>

  <button
  onClick={()=>setActiveCategory("life")}
  className="py-1.5 px-2.5 text-sm rounded-lg bg-gray-100 dark:bg-neutral-700">
    Life stuff
  </button>

  <button
  onClick={()=>setActiveCategory("deals")}
  className="py-1.5 px-2.5 text-sm rounded-lg bg-gray-100 dark:bg-neutral-700">
    Deals
  </button>

</div>

    </div>


    {/* ── Wave Bubble ── */}
    {waveData && (
      <WaveBubble
        data={waveData}
        onDismiss={dismissWave}
        onClick={() => { openChat(waveData.agentId); dismissWave(); }}
      />
    )}


    {/* ── Gossip Toasts ── */}
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-none">
      {gossipToasts.map((toast) => (
        <GossipToast
          key={toast.id}
          data={toast}
          onClick={() => openChat(toast.aboutAgentId)}
        />
      ))}
    </div>


    {/* ── Chat Panel ── */}
    <div
      className="absolute top-0 right-0 h-full backdrop-blur-xl w-min z-20 transition-transform duration-300"
      style={{ transform: chatOpen ? "translateX(0)" : "translateX(100%)" }}
    >
      {activeAgentId && (
        <ChatPanel
          agentId={activeAgentId}
          chat={chat}
          onClose={closeChat}
          socketRef={socketRef}
        />
      )}
    </div>

  </div>
  );
}
