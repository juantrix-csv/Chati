const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3');

describe('RandomChatApp server', () => {
  const PORT = 8081;
  const serverPath = path.join(__dirname, '..', 'server.js');
  const dbPath = path.join(__dirname, '..', 'chat.db');
  let serverProcess;

  beforeEach(done => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT }
    });
    serverProcess.stdout.on('data', data => {
      if (data.toString().includes('Server running')) done();
    });
  });

  afterEach(done => {
    serverProcess.kill();
    serverProcess.on('close', () => done());
  });

  test('pairs clients and forwards messages', done => {
    const ws1 = new WebSocket(`ws://localhost:${PORT}`);
    const ws2 = new WebSocket(`ws://localhost:${PORT}`);
    let room1, room2;

    ws1.on('message', data => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'paired') {
          room1 = msg.room;
          if (room1 && room2) {
            expect(room1).toBe(room2);
            ws1.send('hello');
          }
        }
      } catch {}
    });

    ws2.on('message', data => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'paired') {
          room2 = msg.room;
          if (room1 && room2) {
            expect(room1).toBe(room2);
            ws1.send('hello');
          }
        }
      } catch {
        expect(data.toString()).toBe('hello');
        setTimeout(() => {
          const db = new sqlite3.Database(dbPath);
          db.all('SELECT message FROM messages', (err, rows) => {
            expect(err).toBeNull();
            expect(rows.length).toBe(1);
            expect(rows[0].message).toBe('hello');
            db.close();
            ws1.close();
            ws2.close();
            done();
          });
        }, 200);
      }
    });
  }, 10000);
});
