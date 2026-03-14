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

  return (
  <div className="h-screen w-screen relative overflow-hidden">

    {/* ── Map as full background ── */}
    <div className="absolute inset-0 z-0">
      <CampusMap
        onAgentClick={openChat}
        onMapClick={moveUser}
        socketRef={socketRef}
        placesData={activeAgentId ? chat.getPlacesData(activeAgentId) : null}
        isTyping={chat.typing}
      />

    </div>

    {/* ── Header (floating on top) ── */}
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
        {agents.length} neighbors online
      </div>
    </header>

    {/* ── Left Category Bar (floating on top) ── */}
    <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-1.5">
      {/* Label Button Group */}
<div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
  <a className="py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-sm text-gray-800 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-700 hover:text-gray-900 dark:hover:text-neutral-300 rounded-lg focus:outline-hidden focus:text-gray-900 dark:focus:text-neutral-300" href="#">
    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    Events
  </a>
  <a className="py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-sm text-gray-800 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-700 hover:text-gray-900 dark:hover:text-neutral-300 rounded-lg focus:outline-hidden focus:text-gray-900 dark:focus:text-neutral-300" href="#">
    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
    Food Spots
  </a>
  <a className="py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-sm text-gray-800 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-700 hover:text-gray-900 dark:hover:text-neutral-300 rounded-lg focus:outline-hidden focus:text-gray-900 dark:focus:text-neutral-300" href="#">
    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v2"/><path d="M12 2v2"/><path d="M17 20v2"/><path d="M17 2v2"/><path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/><path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/><path d="M7 20v2"/><path d="M7 2v2"/><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>
    Nature
  </a>
  <a className="py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-sm text-gray-800 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-700 hover:text-gray-900 dark:hover:text-neutral-300 rounded-lg focus:outline-hidden focus:text-gray-900 dark:focus:text-neutral-300" href="#">
    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
    Life stuff
  </a>
  <a className="py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-sm text-gray-800 dark:text-neutral-200 bg-gray-100 dark:bg-neutral-700 hover:text-gray-900 dark:hover:text-neutral-300 rounded-lg focus:outline-hidden focus:text-gray-900 dark:focus:text-neutral-300" href="#">
    <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>
    Deals
  </a>
</div>
{/* End Label Button Group */}
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
        <GossipToast key={toast.id} data={toast} onClick={() => openChat(toast.aboutAgentId)} />
      ))}
    </div>

    {/* ── Chat Panel ── */}
    <div
      className="absolute top-0 right-0 h-full backdrop-blur-xl w-min z-20 transition-transform duration-300"
      style={{ transform: chatOpen ? "translateX(0)" : "translateX(100%)" }}
    >
      {activeAgentId && (
        <ChatPanel agentId={activeAgentId} chat={chat} onClose={closeChat} socketRef={socketRef} />
      )}
    </div>

  </div>
  );
}
