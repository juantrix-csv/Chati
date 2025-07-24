const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// SQLite database for storing messages
const db = new sqlite3.Database('./chat.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT,
    sender TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// In-memory user management
const waitingUsers = [];
const sessions = new Map(); // ws -> { partner: ws, room: string, id: string }

function pairUsers() {
  if (waitingUsers.length >= 2) {
    const user1 = waitingUsers.shift();
    const user2 = waitingUsers.shift();
    const room = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    sessions.set(user1.ws, { partner: user2.ws, room, id: user1.id });
    sessions.set(user2.ws, { partner: user1.ws, room, id: user2.id });
    user1.ws.send(JSON.stringify({ type: 'paired', room }));
    user2.ws.send(JSON.stringify({ type: 'paired', room }));
  }
}

wss.on('connection', ws => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  waitingUsers.push({ ws, id });
  pairUsers();

  ws.on('message', data => {
    const user = sessions.get(ws);
    if (!user || ws.readyState !== WebSocket.OPEN) return;
    const partner = user.partner;
    if (partner.readyState === WebSocket.OPEN) {
      const msg = data.toString();
      partner.send(msg);
      db.run('INSERT INTO messages(room, sender, message) VALUES (?, ?, ?)', [user.room, user.id, msg]);
    }
  });

  ws.on('close', () => {
    // remove from waiting queue
    const index = waitingUsers.findIndex(u => u.ws === ws);
    if (index !== -1) waitingUsers.splice(index, 1);
    const info = sessions.get(ws);
    if (info) {
      const partner = info.partner;
      sessions.delete(partner);
      if (partner.readyState === WebSocket.OPEN) {
        partner.close();
      }
    }
    sessions.delete(ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
