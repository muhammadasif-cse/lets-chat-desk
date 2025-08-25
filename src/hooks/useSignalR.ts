import { ENV_CONFIG } from "@/constants/app.constants";
import { initialConnectionMetrics } from "@/constants/signalR.constants";
import { IConnectionMetrics } from "@/interfaces/signalR";
import * as signalR from "@microsoft/signalr";

import { useCallback, useEffect, useRef, useState } from "react";

// Singleton connection store
let singletonConnection: signalR.HubConnection | null = null;
let singletonConnectionPromise: Promise<signalR.HubConnection | null> | null =
  null;
let singletonAuthUserId: number | null = null;
let singletonToken: string | null = null;
let singletonEventHandlers: Record<string, (...args: any[]) => void> | null =
  null;

export const useSignalR = (
  authUserId: number,
  token: string,
  eventHandlers: Record<string, (...args: any[]) => void>
) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionMetrics, setConnectionMetrics] =
    useState<IConnectionMetrics>(initialConnectionMetrics);

  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectStartTime = useRef<number | null>(null);
  const connectionHealthCheck = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  //* enhanced connection health monitoring
  const startHealthCheck = useCallback((conn: signalR.HubConnection) => {
    //* clear existing health check
    if (connectionHealthCheck.current) {
      clearInterval(connectionHealthCheck.current);
    }

    connectionHealthCheck.current = setInterval(async () => {
      if (conn.state === signalR.HubConnectionState.Connected) {
        try {
          //* send heartbeat to server
          await conn.invoke("Heartbeat");
        } catch (error) {
          // ...existing code...
          setConnectionMetrics((prev) => ({
            ...prev,
            connectionQuality: "poor",
          }));
        }
      }
    }, 30000); //* check every 30 seconds
  }, []);

  //* update connection quality based on metrics
  const updateConnectionQuality = useCallback((reconnectTime?: number) => {
    setConnectionMetrics((prev) => {
      const newMetrics = { ...prev };

      if (reconnectTime) {
        newMetrics.averageReconnectTime =
          prev.averageReconnectTime === 0
            ? reconnectTime
            : (prev.averageReconnectTime + reconnectTime) / 2;
      }

      //* determine quality based on metrics
      if (prev.totalDisconnections === 0 && prev.averageReconnectTime < 2000) {
        newMetrics.connectionQuality = "excellent";
      } else if (
        prev.totalDisconnections < 3 &&
        prev.averageReconnectTime < 5000
      ) {
        newMetrics.connectionQuality = "good";
      } else if (
        prev.totalDisconnections < 10 &&
        prev.averageReconnectTime < 15000
      ) {
        newMetrics.connectionQuality = "poor";
      } else {
        newMetrics.connectionQuality = "critical";
      }

      return newMetrics;
    });
  }, []);

  const initializeConnection = useCallback(async () => {
    if (
      singletonConnection &&
      singletonAuthUserId === authUserId &&
      singletonToken === token &&
      singletonEventHandlers === eventHandlers
    ) {
      return singletonConnection;
    }
    if (singletonConnectionPromise) {
      return singletonConnectionPromise;
    }
    singletonConnectionPromise = (async () => {
      if (!authUserId || !token) {
        setConnectionError("Authentication required");
        singletonConnectionPromise = null;
        return null;
      }
      try {
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${ENV_CONFIG.SOCKET_URL}/chat-hub`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
            accessTokenFactory: () => token,
            timeout: 30000,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              const baseDelay = Math.min(
                1000 * Math.pow(2, retryContext.previousRetryCount),
                30000
              );
              const jitter = Math.random() * 1000;
              return baseDelay + jitter;
            },
          })
          .configureLogging(signalR.LogLevel.None)
          .build();

        newConnection.onclose((error) => {
          setIsConnected(false);
          setConnectionMetrics((prev) => ({
            ...prev,
            totalDisconnections: prev.totalDisconnections + 1,
          }));
          if (error) {
            if (error.message.includes("timeout")) {
              setConnectionError("Connection timeout - server may be slow");
            } else if (
              error.message.includes("unauthorized") ||
              error.message.includes("401")
            ) {
              setConnectionError("Authentication failed - please login again");
            } else if (
              error.message.includes("network") ||
              error.message.includes("fetch")
            ) {
              setConnectionError(
                "Network error - check your internet connection"
              );
            } else {
              setConnectionError(error.message || "Connection lost");
            }
          } else {
            setConnectionError("Connection closed unexpectedly");
          }
          if (connectionHealthCheck.current) {
            clearInterval(connectionHealthCheck.current);
          }
        });

        newConnection.onreconnecting((error) => {
          setIsConnected(false);
          reconnectAttempts.current++;
          reconnectStartTime.current = Date.now();
          setConnectionError("Reconnecting to server...");
        });

        newConnection.onreconnected((connectionId) => {
          setIsConnected(true);
          setConnectionError(null);
          const reconnectTime = reconnectStartTime.current
            ? Date.now() - reconnectStartTime.current
            : 0;
          setConnectionMetrics((prev) => ({
            ...prev,
            lastConnected: Date.now(),
          }));
          updateConnectionQuality(reconnectTime);
          reconnectAttempts.current = 0;
          reconnectStartTime.current = null;
          startHealthCheck(newConnection);
          newConnection.invoke("Connect", authUserId).catch((error) => {
            setConnectionError("Authentication failed after reconnection");
          });
        });

        await newConnection.start();
        await newConnection.invoke("Connect", authUserId);
        console.log("✅ SignalR connected successfully");
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          newConnection.on(event, handler);
        });
        setConnection(newConnection);
        setIsConnected(true);
        setConnectionError(null);
        setConnectionMetrics((prev) => ({
          ...prev,
          lastConnected: Date.now(),
        }));
        reconnectAttempts.current = 0;
        startHealthCheck(newConnection);

        singletonConnection = newConnection;
        singletonAuthUserId = authUserId;
        singletonToken = token;
        singletonEventHandlers = eventHandlers;
        singletonConnectionPromise = null;
        return newConnection;
      } catch (error) {
        let errorMessage = "Connection failed";
        if (error instanceof Error) {
          if (error.message.includes("Failed to negotiate")) {
            errorMessage = "Server negotiation failed - server may be down";
          } else if (error.message.includes("WebSocket")) {
            errorMessage = "WebSocket connection failed - network issues";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Connection timeout - server is not responding";
          } else if (
            error.message.includes("401") ||
            error.message.includes("unauthorized")
          ) {
            errorMessage = "Authentication failed - please login again";
          } else if (
            error.message.includes("403") ||
            error.message.includes("forbidden")
          ) {
            errorMessage = "Access denied - insufficient permissions";
          } else if (
            error.message.includes("503") ||
            error.message.includes("502")
          ) {
            errorMessage = "Server is temporarily unavailable";
          } else {
            errorMessage = error.message;
          }
        }
        setConnectionError(errorMessage);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          setTimeout(() => {
            reconnectAttempts.current++;
            initializeConnection();
          }, delay);
        } else {
          setConnectionError("Unable to connect - maximum retries exceeded");
          setConnectionMetrics((prev) => ({
            ...prev,
            connectionQuality: "critical",
          }));
        }
        singletonConnectionPromise = null;
        return null;
      }
    })();
    return singletonConnectionPromise;
  }, [
    authUserId,
    token,
    eventHandlers,
    startHealthCheck,
    updateConnectionQuality,
  ]);

  //! cleanup connection with proper resource management
  const cleanupConnection = useCallback(
    (conn: signalR.HubConnection | null) => {
      if (conn) {
        //* clear event handlers
        Object.keys(eventHandlers).forEach((event) => {
          conn.off(event);
        });

        //* stop connection gracefully
        if (conn.state === signalR.HubConnectionState.Connected) {
          conn.stop();
        }
      }

      //* clear timers
      if (connectionHealthCheck.current) {
        clearInterval(connectionHealthCheck.current);
        connectionHealthCheck.current = null;
      }

      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }

      setConnection(null);
      setIsConnected(false);
    },
    [eventHandlers]
  );

  useEffect(() => {
    let isMounted = true;
    let currentConnection: signalR.HubConnection | null = null;
    const setupConnection = async () => {
      if (!isMounted) return;
      currentConnection = await initializeConnection();
      if (isMounted && currentConnection) {
        setConnection(currentConnection);
      }
    };
    setupConnection();
    return () => {
      isMounted = false;
      if (
        singletonConnection &&
        singletonAuthUserId === authUserId &&
        singletonToken === token &&
        singletonEventHandlers === eventHandlers
      ) {
        cleanupConnection(currentConnection);
        singletonConnection = null;
        singletonAuthUserId = null;
        singletonToken = null;
        singletonEventHandlers = null;
      }
    };
  }, [authUserId, token]);

  //! Re-register event handlers when they change
  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      Object.keys(eventHandlers).forEach((event) => {
        connection.off(event);
      });
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        connection.on(event, handler);
      });
      singletonEventHandlers = eventHandlers;
    }
  }, [eventHandlers, connection]);

  //! manual reconnection method with reset
  const reconnect = useCallback(async () => {
    reconnectAttempts.current = 0;

    if (connection) {
      cleanupConnection(connection);
    }

    setConnectionError("Reconnecting...");
    await initializeConnection();
  }, [connection, cleanupConnection, initializeConnection]);

  //! connection status checker with enhanced validation
  const checkConnection = useCallback(() => {
    return (
      connection?.state === signalR.HubConnectionState.Connected && isConnected
    );
  }, [connection, isConnected]);

  const forceReconnect = useCallback(async () => {
    reconnectAttempts.current = 0;
    setConnectionMetrics((prev) => ({
      ...prev,
      totalDisconnections: 0,
      connectionQuality: "excellent",
    }));
    await reconnect();
  }, [reconnect]);

  return {
    connection,
    isConnected,
    connectionError,
    connectionMetrics,
    reconnect,
    forceReconnect,
    checkConnection,
    reconnectAttempts: reconnectAttempts.current,
  };
};
