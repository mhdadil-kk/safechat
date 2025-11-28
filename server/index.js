import express from 'express';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import http from 'http';

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server (Render provides SSL termination)
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Data structures
const waitingQueue = []; // Users waiting to be matched
const activeRooms = new Map(); // roomId -> { user1, user2 }
const userSockets = new Map(); // userId -> { ws, roomId, interests, mode }

// Helper: Send JSON message to a WebSocket client
function sendMessage(ws, type, data = {}) {
  if (ws.readyState === 1) { // OPEN
    ws.send(JSON.stringify({ type, ...data }));
  }
}

// Helper: Find a match for a user
function findMatch(userId, interests, mode) {
  // Simple matching: find first user in queue with same mode
  // In production, you'd match by interests, language, etc.
  const matchIndex = waitingQueue.findIndex(
    (user) => user.userId !== userId && user.mode === mode
  );

  if (matchIndex !== -1) {
    const match = waitingQueue.splice(matchIndex, 1)[0];
    return match;
  }
  return null;
}

// Helper: Create a room for two users
function createRoom(user1Id, user2Id) {
  const roomId = uuidv4();
  activeRooms.set(roomId, { user1: user1Id, user2: user2Id });

  const user1Data = userSockets.get(user1Id);
  const user2Data = userSockets.get(user2Id);

  if (user1Data) user1Data.roomId = roomId;
  if (user2Data) user2Data.roomId = roomId;

  return roomId;
}

// Helper: Get partner's userId in a room
function getPartner(userId) {
  const userData = userSockets.get(userId);
  if (!userData || !userData.roomId) return null;

  const room = activeRooms.get(userData.roomId);
  if (!room) return null;

  return room.user1 === userId ? room.user2 : room.user1;
}

// Helper: Clean up user from all data structures
function cleanupUser(userId) {
  const userData = userSockets.get(userId);

  // Remove from waiting queue
  const queueIndex = waitingQueue.findIndex(u => u.userId === userId);
  if (queueIndex !== -1) {
    waitingQueue.splice(queueIndex, 1);
  }

  // Handle room cleanup
  if (userData && userData.roomId) {
    const partnerId = getPartner(userId);
    const room = activeRooms.get(userData.roomId);

    // Notify partner
    if (partnerId) {
      const partnerData = userSockets.get(partnerId);
      if (partnerData) {
        sendMessage(partnerData.ws, 'peer_disconnected');
        partnerData.roomId = null;
      }
    }

    // Delete room
    activeRooms.delete(userData.roomId);
  }

  // Remove user socket
  userSockets.delete(userId);
}

// Helper: Broadcast user count to all connected clients
function broadcastUserCount() {
  const count = userSockets.size;
  const message = JSON.stringify({ type: 'user_count', count });

  for (const [_, userData] of userSockets) {
    if (userData.ws.readyState === 1) {
      userData.ws.send(message);
    }
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  const userId = uuidv4();
  console.log(`[${userId}] New connection`);

  userSockets.set(userId, { ws, roomId: null, interests: [], mode: 'video' });

  // Send userId to client
  sendMessage(ws, 'connected', { userId });

  // Broadcast new user count
  broadcastUserCount();

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type } = data;

      console.log(`[${userId}] Received: ${type}`);

      switch (type) {
        case 'start_search': {
          const { interests = [], mode = 'video' } = data;
          const userData = userSockets.get(userId);
          if (userData) {
            userData.interests = interests;
            userData.mode = mode;
          }

          // Try to find a match
          const match = findMatch(userId, interests, mode);

          if (match) {
            // Found a match!
            const roomId = createRoom(userId, match.userId);

            console.log(`[${userId}] Matched with [${match.userId}] in room ${roomId}`);

            sendMessage(ws, 'match_found', { roomId, partnerId: match.userId });
            sendMessage(match.ws, 'match_found', { roomId, partnerId: userId });

            // User1 will be the caller (creates offer)
            sendMessage(ws, 'start_call', { shouldCreateOffer: true });
            sendMessage(match.ws, 'start_call', { shouldCreateOffer: false });

          } else {
            // No match, add to queue
            waitingQueue.push({ userId, ws, interests, mode });
            sendMessage(ws, 'searching');
            console.log(`[${userId}] Added to queue. Queue size: ${waitingQueue.length}`);
          }
          break;
        }

        case 'webrtc_offer':
        case 'webrtc_answer':
        case 'webrtc_ice_candidate': {
          // Relay WebRTC signaling to partner
          const partnerId = getPartner(userId);
          if (partnerId) {
            const partnerData = userSockets.get(partnerId);
            if (partnerData) {
              sendMessage(partnerData.ws, type, data);
              console.log(`[${userId}] Relayed ${type} to [${partnerId}]`);
            }
          }
          break;
        }

        case 'chat_message': {
          // Relay chat message to partner
          const partnerId = getPartner(userId);
          if (partnerId) {
            const partnerData = userSockets.get(partnerId);
            if (partnerData) {
              sendMessage(partnerData.ws, 'chat_message', {
                text: data.text,
                timestamp: Date.now()
              });
              console.log(`[${userId}] Sent message to [${partnerId}]`);
            }
          }
          break;
        }

        case 'disconnect_peer': {
          // User wants to skip/disconnect
          const partnerId = getPartner(userId);
          const userData = userSockets.get(userId);

          if (partnerId) {
            const partnerData = userSockets.get(partnerId);
            if (partnerData) {
              sendMessage(partnerData.ws, 'peer_disconnected');
              partnerData.roomId = null;
            }
          }

          if (userData && userData.roomId) {
            activeRooms.delete(userData.roomId);
            userData.roomId = null;
          }

          sendMessage(ws, 'disconnected');
          console.log(`[${userId}] Disconnected from peer`);
          break;
        }

        default:
          console.log(`[${userId}] Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error(`[${userId}] Error processing message:`, error);
    }
  });

  ws.on('close', () => {
    console.log(`[${userId}] Connection closed`);
    cleanupUser(userId);
    broadcastUserCount();
    console.log(`Active connections: ${userSockets.size}, Queue: ${waitingQueue.length}, Rooms: ${activeRooms.size}`);
  });

  ws.on('error', (error) => {
    console.error(`[${userId}] WebSocket error:`, error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: userSockets.size,
    waiting: waitingQueue.length,
    activeRooms: activeRooms.size
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
