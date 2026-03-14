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
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* ── Header ─────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm z-20 shrink-0">
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

      {/* ── Main Content ───────────────────────────── */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map */}
        <div
          className="flex-1 relative transition-all duration-300"
          style={{ marginRight: chatOpen ? "380px" : "0" }}
        >
          <CampusMap
            onAgentClick={openChat}
            onMapClick={moveUser}
            socketRef={socketRef}
          />

          {/* Wave Bubble (floating on map) */}
          {waveData && (
            <WaveBubble
              data={waveData}
              onDismiss={dismissWave}
              onClick={() => {
                openChat(waveData.agentId);
                dismissWave();
              }}
            />
          )}

          {/* Gossip Toasts (stacked on right edge of map) */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-none">
            {gossipToasts.map((toast) => (
              <GossipToast
                key={toast.id}
                data={toast}
                onClick={() => openChat(toast.aboutAgentId)}
              />
            ))}
          </div>
        </div>

        {/* Chat Panel (slides in from right) */}
        <div
          className="absolute top-0 right-0 h-full w-[380px] z-20 transition-transform duration-300"
          style={{
            transform: chatOpen ? "translateX(0)" : "translateX(100%)",
          }}
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

      {/* ── Bottom Agent Bar ───────────────────────── */}
      <div className="shrink-0 border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-sm px-4 py-2 z-20">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={agent.id === activeAgentId}
              onClick={() => openChat(agent.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
