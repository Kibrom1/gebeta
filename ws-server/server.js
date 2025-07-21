// Simple Gebeta WebSocket server for online play
const WebSocket = require('ws');
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ host: HOST, port: PORT });

let games = {};

wss.on('connection', ws => {
  ws.on('message', message => {
    let data;
    try { data = JSON.parse(message); } catch { return; }
    if (data.type === 'create') {
      const gameId = Math.random().toString(36).substr(2, 6);
      games[gameId] = { host: ws, guest: null, state: data.state };
      ws.send(JSON.stringify({ type: 'created', gameId }));
    } else if (data.type === 'join') {
      const game = games[data.gameId];
      if (game && !game.guest) {
        game.guest = ws;
        ws.send(JSON.stringify({ type: 'joined', gameId: data.gameId }));
        game.host.send(JSON.stringify({ type: 'start', state: game.state }));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found or already has a guest.' }));
      }
    } else if (data.type === 'move') {
      const game = games[data.gameId];
      if (game) {
        game.state = data.state;
        if (ws === game.host && game.guest) game.guest.send(JSON.stringify({ type: 'update', state: data.state }));
        if (ws === game.guest && game.host) game.host.send(JSON.stringify({ type: 'update', state: data.state }));
      }
    }
  });
  ws.on('close', () => {
    // Optionally clean up games here
  });
});

console.log(`WebSocket server running on ${HOST}:${PORT}`);
