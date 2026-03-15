import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";

export const useSocket = (token) => {
  const mounted = useRef(false);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    mounted.current = true;
    connectSocket(token);

    return () => {
      mounted.current = false;
      disconnectSocket();
    };
  }, [token]);

  return getSocket();
};
