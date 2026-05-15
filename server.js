/**
 * COMBATris Online — Signaling + Game Relay Server
 * All game messages go through Socket.io (no WebRTC needed)
 * Deploy free on Railway / Render / Fly.io
 * Install:  npm install
 * Run:      node server.js
 */

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('COMBATris Online Signaling Server — OK
');
});

const io = new Server(httpServer, {
  cors: {
    origin: ['https://magnusinfrance.fr', 'http://localhost:3000', 'http://localhost:8000', 'null'],
    methods: ['GET', 'POST'],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  pingInterval: 5000,
  pingTimeout: 10000
});

const rooms = new Map(); // code -> { host, guest }

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function findRoomBySocket(socketId) {
  for (const [code, room] of rooms.entries()) {
    if (room.host === socketId || room.guest === socketId) return { code, room };
  }
  return null;
}

function cleanupSocket(socketId) {
  const found = findRoomBySocket(socketId);
  if (!found) return;
  const { code, room } = found;
  const other = room.host === socketId ? room.guest : room.host;
  if (other) io.to(other).emit('peer-left');
  rooms.delete(code);
  console.log(`[room] ${code} closed`);
}

io.on('connection', socket => {
  console.log(`[+] ${socket.id} connected (transport: ${socket.conn.transport.name})`);

  socket.on('create-room', () => {
    cleanupSocket(socket.id);
    let code;
    do { code = makeCode(); } while (rooms.has(code));
    rooms.set(code, { host: socket.id, guest: null });
    socket.join(code);
    socket.emit('room-created', { code });
    console.log(`[room] ${code} created by ${socket.id}`);
  }