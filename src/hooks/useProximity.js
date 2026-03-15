import { useCallback, useRef } from "react";
import { useDrift } from "../context/DriftContext";

export function useProximity(socketRef) {
  const { setUserLocation } = useDrift();
  const lastEmitRef = useRef(0);

  const moveUser = useCallback(
    (lat, lng) => {
      setUserLocation({ lat, lng });

      // Throttle: emit immediately, then max once per 150ms
      const now = Date.now();
      if (now - lastEmitRef.current < 150) return;
      lastEmitRef.current = now;

      const socket = socketRef?.current;
      if (socket) {
        socket.emit("user:move", { lat, lng });
      }
    },
    [socketRef, setUserLocation]
  );

  return { moveUser };
}