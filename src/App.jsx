import { useDrift } from "./context/DriftContext";
import { useSocket } from "./hooks/useSocket";
import AppShell from "./components/Layout/AppShell";


export default function App() {
  const { loading, error } = useDrift();
  const socketRef = useSocket();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <div className="text-slate-400 text-sm tracking-widest">DRIFT</div>
          <div className="text-slate-600 text-xs mt-2">Loading campus...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-400 text-sm">Failed to connect</div>
          <div className="text-slate-600 text-xs mt-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <AppShell socketRef={socketRef} />;
}
