import { useEffect, useRef, useCallback } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { GameState } from '../types';
import toast from 'react-hot-toast';

interface UseP2PProps {
  onGameStart: (symbol: 'X' | 'O') => void;
  onGameUpdate: (gameState: GameState) => void;
  onOpponentDisconnect: () => void;
  onWaitingForOpponent: () => void;
}

export const useP2P = ({
  onGameStart,
  onGameUpdate,
  onOpponentDisconnect,
  onWaitingForOpponent,
}: UseP2PProps) => {
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const gameCodeRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    gameCodeRef.current = null;
  }, []);

  const handleConnection = useCallback((conn: DataConnection, isHost: boolean) => {
    connectionRef.current = conn;

    conn.on('open', () => {
      onGameStart(isHost ? 'X' : 'O');
      toast.success('Connected to opponent!');
    });

    conn.on('data', (data: any) => {
      if (data.type === 'game_move') {
        onGameUpdate(data.gameState);
      }
    });

    conn.on('close', () => {
      onOpponentDisconnect();
      cleanup();
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
      toast.error('Connection error occurred');
      cleanup();
    });
  }, [onGameStart, onGameUpdate, onOpponentDisconnect, cleanup]);

  const hostGame = useCallback(() => {
    cleanup();

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      gameCodeRef.current = id;
      onWaitingForOpponent();
      toast.success(`Your game code: ${id}`);
    });

    peer.on('connection', (conn) => {
      if (connectionRef.current) {
        conn.close();
        return;
      }
      handleConnection(conn, true);
    });

    peer.on('error', (error) => {
      console.error('Peer error:', error);
      toast.error('Failed to create game');
      cleanup();
    });
  }, [handleConnection, onWaitingForOpponent, cleanup]);

  const joinGame = useCallback((gameCode: string) => {
    cleanup();

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(gameCode);
      handleConnection(conn, false);
    });

    peer.on('error', (error) => {
      console.error('Peer error:', error);
      toast.error('Failed to join game');
      cleanup();
    });
  }, [handleConnection, cleanup]);

  const sendGameMove = useCallback((gameState: GameState) => {
    if (connectionRef.current?.open) {
      connectionRef.current.send({
        type: 'game_move',
        gameState,
      });
    } else {
      toast.error('Cannot send move: Connection lost');
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    hostGame,
    joinGame,
    sendGameMove,
    disconnect: cleanup,
    gameCode: gameCodeRef.current,
  };
};