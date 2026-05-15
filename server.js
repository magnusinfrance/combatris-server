/**
 * COMBATris Online — Signaling + Lobby Server
 * Node.js + Socket.io
 *
 * Deploy free on Railway / Render / Fly.io
 *
 * Install:  npm install
 * Run:      node server.js
 * Env vars: PORT (default 3000)
 */

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('COMBATris Online Signaling Server — OK\n');
});

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// rooms: Map<roomCode, { host: socketId, guest: socketId|null, started: bool }>
const rooms = new Map();

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function cleanupSocket(socketId) {
  for (const [code, room] of rooms.entries()) {
    if (room.host === socketId || room.guest === socketId) {
      // Notify the other peer
      const other = room.host === socketId ? room.guest : room.host;
      if (other) io.to(other).emit('peer-left');
      rooms.delete(code);
      break;
    }
  }
}

io.on('connection', socket => {
  console.log(`[+] ${socket.id} connected`);

  // ── CREATE ROOM ──────────────────────────────────────────
  socket.on('create-room', () => {
    // Remove any existing room for this socket
    cleanupSocket(socket.id);
    let code;
    do { code = makeCode(); } while (rooms.has(code));
    rooms.set(code, { host: socket.id, guest: null, started: false });
    socket.join(code);
    socket.emit('room-created', { code });
    console.log(`[room] ${code} created by ${socket.id}`);
  });

  // ── JOIN ROOM ────────────────────────────────────────────
  socket.on('join-room', ({ code }) => {
    const room = rooms.get(code?.toUpperCase());
    if (!room) { socket.emit('join-error', 'Room not found'); return; }
    if (room.guest) { socket.emit('join-error', 'Room is full'); return; }
    if (room.started) { socket.emit('join-error', 'Game already started'); return; }
    if (room.host === socket.id) { socket.emit('join-error', 'Cannot join your own room'); return; }

    room.guest = socket.id;
    socket.join(code);
    room.started = true;

    // Tell host they are the "offerer" (P1/host) and give them the guest's socket id
    io.to(room.host).emit('peer-joined', { peerId: socket.id, isHost: true });
    // Tell guest they are the "answerer" (P2/guest)
    socket.emit('peer-joined', { peerId: room.host, isHost: false });
    console.log(`[room] ${code}: ${socket.id} joined — starting`);
  });

  // ── WebRTC SIGNALING RELAY ───────────────────────────────
  // Relay offer / answer / ICE candidates between peers
  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  // ── DISCONNECT ───────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id} disconnected`);
    cleanupSocket(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`COMBATris signaling server listening on :${PORT}`);
});
