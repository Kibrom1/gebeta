import React, { useState, useRef, useCallback } from 'react';

const WS_SERVER_URL = 'wss://gebeta-ws-server.fly.dev/';

export const useWebSocket = (onMessage) => {
  const [ws, setWs] = useState(null);
  const [gameId, setGameId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState('idle');
  const [onlineError, setOnlineError] = useState('');
  const [remotePlayerJoined, setRemotePlayerJoined] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = useCallback((onOpenMessage) => {
    if (wsRef.current) return;
    
    try {
      const socket = new WebSocket(WS_SERVER_URL);
      wsRef.current = socket;
      setWs(socket);
      
      socket.onopen = () => {
        setOnlineStatus('waiting');
        if (onOpenMessage) {
          socket.send(JSON.stringify(onOpenMessage));
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setOnlineError('Invalid message from server');
        }
      };
      
      socket.onclose = (event) => {
        setWs(null);
        wsRef.current = null;
        setOnlineStatus('idle');
        setRemotePlayerJoined(false);
        
        // Attempt reconnection if not a normal closure and we have attempts left
        if (event.code !== 1000 && reconnectAttempts < 3) {
          setOnlineError('Connection lost. Attempting to reconnect...');
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(onOpenMessage);
          }, 2000 * (reconnectAttempts + 1)); // Exponential backoff
        } else if (reconnectAttempts >= 3) {
          setOnlineError('Failed to reconnect. Please try again.');
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setOnlineError('Connection error occurred');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setOnlineError('Failed to connect to server');
    }
  }, [handleWebSocketMessage, reconnectAttempts]);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'created':
        setGameId(data.gameId);
        setIsHost(true);
        setOnlineStatus('waiting');
        onMessage?.('Game created. Waiting for opponent to join...');
        break;
      case 'start':
        setOnlineStatus('playing');
        setRemotePlayerJoined(true);
        onMessage?.('Opponent joined. Game started!');
        break;
      case 'update':
        onMessage?.('Opponent made a move.');
        break;
      case 'error':
        setOnlineError(data.message);
        onMessage?.('Error: ' + data.message);
        break;
      case 'joined':
        setOnlineStatus('playing');
        setRemotePlayerJoined(true);
        onMessage?.('Joined game. Waiting for host to start.');
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }, [onMessage]);

  const createGame = useCallback((initialState) => {
    connectWebSocket({ type: 'create', state: initialState });
  }, [connectWebSocket]);

  const joinGame = useCallback((gameIdToJoin) => {
    if (!gameIdToJoin.trim()) {
      setOnlineError('Please enter a game ID');
      return;
    }
    connectWebSocket({ type: 'join', gameId: gameIdToJoin });
  }, [connectWebSocket]);

  const sendMove = useCallback((newBoard) => {
    if (wsRef.current && gameId) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'move', gameId, state: newBoard }));
      } catch (error) {
        console.error('Error sending move:', error);
        setOnlineError('Failed to send move');
      }
    }
  }, [gameId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
    }
    setReconnectAttempts(0);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, []);

  return {
    ws,
    gameId,
    setGameId,
    isHost,
    onlineStatus,
    onlineError,
    setOnlineError,
    remotePlayerJoined,
    createGame,
    joinGame,
    sendMove,
    disconnect
  };
};
