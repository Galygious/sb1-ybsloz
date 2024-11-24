import { useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types';
import toast from 'react-hot-toast';

interface UseMultiplayerProps {
  onGameStart: (symbol: 'X' | 'O') => void;
  onGameUpdate: (gameState: GameState) => void;
  onOpponentDisconnect: () => void;
  onWaitingForOpponent: () => void;
}

export const useMultiplayer = ({
  onGameStart,
  onGameUpdate,
  onOpponentDisconnect,
  onWaitingForOpponent,
}: UseMultiplayerProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      // Use secure WebSocket for production
      const wsUrl = import.meta.env.PROD 
        ? 'wss://ultimate-tictactoe-server.onrender.com'
        : 'ws://localhost:3001';
        
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to server');
        ws.send(JSON.stringify({ type: 'find_match' }));
      };

      // Rest of the WebSocket logic remains the same
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'connected':
              console.log('Server connection confirmed');
              break;

            case 'game_start':
              roomIdRef.current = data.roomId;
              onGameStart(data.symbol);
              break;

            case 'game_update':
              onGameUpdate(data.gameState);
              break;

            case 'opponent_disconnected':
              onOpponentDisconnect();
              toast.error('Opponent disconnected');
              break;

            case 'waiting_for_opponent':
              onWaitingForOpponent();
              break;

            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;

            case 'error':
              toast.error(data.message || 'An error occurred');
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
          toast.error('Failed to process game update');
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from server');
        toast.error('Connection lost. Attempting to reconnect...');
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (wsRef.current === ws) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error occurred');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to establish connection:', error);
      toast.error('Failed to connect to game server');
    }
  }, [onGameStart, onGameUpdate, onOpponentDisconnect, onWaitingForOpponent]);

  const sendGameMove = useCallback((gameState: GameState) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && roomIdRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: 'game_move',
          roomId: roomIdRef.current,
          gameState,
        })
      );
    } else {
      toast.error('Cannot send move: Connection lost');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      if (roomIdRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: 'game_ended',
            roomId: roomIdRef.current,
          })
        );
      }
      wsRef.current.close();
      wsRef.current = null;
      roomIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendGameMove,
  };
};