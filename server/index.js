import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Game rooms and waiting players
const rooms = new Map();
const waitingPlayers = new Set();

// Helper to send messages
const sendMessage = (ws, type, data) => {
  ws.send(JSON.stringify({ type, ...data }));
};

// Handle disconnection
const handleDisconnect = (ws) => {
  // Remove from waiting players if applicable
  waitingPlayers.delete(ws);

  // Find and clean up any room the player was in
  rooms.forEach((room, roomId) => {
    if (room.players.includes(ws)) {
      const otherPlayer = room.players.find(player => player !== ws);
      if (otherPlayer && otherPlayer.readyState === 1) {
        sendMessage(otherPlayer, 'opponent_disconnected');
      }
      rooms.delete(roomId);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('New connection established');

  // Send initial connection success message
  sendMessage(ws, 'connected', { message: 'Successfully connected to server' });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'find_match':
          if (waitingPlayers.size > 0) {
            const opponent = waitingPlayers.values().next().value;
            waitingPlayers.delete(opponent);

            const roomId = uuidv4();
            const room = {
              id: roomId,
              players: [opponent, ws],
              gameState: null
            };
            rooms.set(roomId, room);

            // Randomly assign X and O
            const isFirstPlayerX = Math.random() < 0.5;
            sendMessage(opponent, 'game_start', {
              roomId,
              symbol: isFirstPlayerX ? 'X' : 'O'
            });
            sendMessage(ws, 'game_start', {
              roomId,
              symbol: isFirstPlayerX ? 'O' : 'X'
            });
          } else {
            waitingPlayers.add(ws);
            sendMessage(ws, 'waiting_for_opponent');
          }
          break;

        case 'game_move':
          const room = rooms.get(data.roomId);
          if (room) {
            room.gameState = data.gameState;
            const opponent = room.players.find(player => player !== ws);
            if (opponent && opponent.readyState === 1) {
              sendMessage(opponent, 'game_update', {
                gameState: data.gameState
              });
            }
          }
          break;

        case 'game_ended':
          const endedRoom = rooms.get(data.roomId);
          if (endedRoom) {
            rooms.delete(data.roomId);
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      sendMessage(ws, 'error', { message: 'Failed to process message' });
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', () => {
    handleDisconnect(ws);
  });
});

// Ping all clients every 30 seconds to keep connections alive
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      sendMessage(client, 'ping');
    }
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});