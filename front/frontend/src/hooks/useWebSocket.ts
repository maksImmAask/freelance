import React from "react";

import { storage } from "../utils/storage";

interface UseWebSocketOptions {
  chatId: number | null;
  enabled?: boolean;
  onMessage?: (
    data: unknown
  ) => void;
}

interface UseWebSocketResult {
  isConnected: boolean;
  sendMessage: (
    data: unknown
  ) => void;
}

export default function useWebSocket({
  chatId,
  enabled = true,
  onMessage,
}: UseWebSocketOptions): UseWebSocketResult {
  const [
    isConnected,
    setIsConnected,
  ] = React.useState(false);

  const socketRef =
    React.useRef<WebSocket | null>(
      null
    );

  const reconnectTimeoutRef =
    React.useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const onMessageRef =
    React.useRef(onMessage);

  React.useEffect(() => {
    onMessageRef.current =
      onMessage;
  }, [onMessage]);

  React.useEffect(() => {
    if (
      !enabled ||
      !chatId
    ) {
      return;
    }

    const accessToken =
      storage.getAccessToken();

    if (!accessToken) {
      return;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL as string;

    const apiUrlObject =
      new URL(apiUrl);

    const protocol =
      apiUrlObject.protocol ===
      "https:"
        ? "wss:"
        : "ws:";

    const wsUrl =
      `${protocol}//${apiUrlObject.host}` +
      `/ws/chat/${chatId}/` +
      `?token=${encodeURIComponent(
        accessToken
      )}`;

    const socket =
      new WebSocket(wsUrl);

    socketRef.current =
      socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (
      event
    ) => {
      try {
        const data =
          JSON.parse(
            event.data
          );

        onMessageRef.current?.(
          data
        );
      } catch {
        onMessageRef.current?.(
          event.data
        );
      }
    };

    socket.onclose = () => {
      setIsConnected(false);

      reconnectTimeoutRef.current =
        setTimeout(() => {
          if (
            socketRef.current ===
            socket
          ) {
            const newSocket =
              new WebSocket(
                wsUrl
              );

            socketRef.current =
              newSocket;

            newSocket.onopen =
              () => {
                setIsConnected(
                  true
                );
              };

            newSocket.onmessage =
              (event) => {
                try {
                  const data =
                    JSON.parse(
                      event.data
                    );

                  onMessageRef.current?.(
                    data
                  );
                } catch {
                  onMessageRef.current?.(
                    event.data
                  );
                }
              };

            newSocket.onclose =
              () => {
                setIsConnected(
                  false
                );
              };
          }
        }, 3000);
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      if (
        reconnectTimeoutRef.current
      ) {
        clearTimeout(
          reconnectTimeoutRef.current
        );
      }

      socket.close();

      socketRef.current =
        null;

      setIsConnected(false);
    };
  }, [
    chatId,
    enabled,
  ]);

  const sendMessage =
    React.useCallback(
      (data: unknown) => {
        const socket =
          socketRef.current;

        if (
          !socket ||
          socket.readyState !==
            WebSocket.OPEN
        ) {
          return;
        }

        socket.send(
          JSON.stringify(data)
        );
      },
      []
    );

  return {
    isConnected,
    sendMessage,
  };
}