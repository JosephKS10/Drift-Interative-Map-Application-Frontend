import { useCallback, useRef } from "react";
import { useDrift } from "../context/DriftContext";

/**
 * useProximity — handles user movement and proximity emission.
 *
 * @param {object} socketRef - ref to Socket.IO instance
 */
export function useProximity(socketRef) {
  const { setUserLocation } = useDrift();
  const debounceRef = useRef(null);

  /**
   * Call this when user position changes (drag, click-to-teleport).
   * Debounces socket emission to 200ms.
   */
  const moveUser = useCallback(
    (lat, lng) => {
      setUserLocation({ lat, lng });

      // Debounce the socket emission
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const socket = socketRef?.current;
        if (socket) {
          socket.emit("user:move", { lat, lng });
        }
      }, 200);
    },
    [socketRef, setUserLocation]
  );

  return { moveUser };
}
