#!/usr/bin/env tsx

import { WebSocketServer, WebSocket } from 'ws';
import { watch, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Read port from environment variable or use default
const PORT = parseInt(process.env.NEXT_PUBLIC_WS_PORT || process.env.WS_PORT || '3001', 10);
const OUTPUT_DIR = join(process.cwd(), '..', 'output');
const STATE_FILE = join(OUTPUT_DIR, 'project-state.json');

interface Client {
  ws: WebSocket;
  id: string;
}

const clients: Client[] = [];

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);

// Broadcast to all connected clients
function broadcast(message: any) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

// Watch for file changes in output directory
if (existsSync(OUTPUT_DIR)) {
  watch(OUTPUT_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    console.log(`📝 File ${eventType}: ${filename}`);

    // Handle different file types
    if (filename === 'project-state.json') {
      try {
        const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
        broadcast({ type: 'state_update', data: state });
      } catch (error) {
        console.error('Failed to read state file:', error);
      }
    } else if (filename.endsWith('.json') && filename.includes('agent')) {
      // Agent update
      broadcast({
        type: 'agent_update',
        data: {
          id: filename,
          status: 'running',
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // File created/modified
      broadcast({
        type: 'file_created',
        data: {
          path: filename,
          timestamp: new Date().toISOString(),
        },
      });
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  const clientId = Math.random().toString(36).substring(7);
  const client: Client = { ws, id: clientId };
  clients.push(client);

  console.log(`✅ Client connected: ${clientId} (Total: ${clients.length})`);

  // Send current state if available
  if (existsSync(STATE_FILE)) {
    try {
      const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
      ws.send(JSON.stringify({ type: 'state_update', data: state }));
    } catch (error) {
      console.error('Failed to send initial state:', error);
    }
  }

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📨 Message from ${clientId}:`, data);

      // Handle different message types
      if (data.type === 'log') {
        broadcast({
          type: 'log',
          data: {
            ...data.data,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  });

  ws.on('close', () => {
    const index = clients.findIndex(c => c.id === clientId);
    if (index > -1) {
      clients.splice(index, 1);
    }
    console.log(`❌ Client disconnected: ${clientId} (Total: ${clients.length})`);
  });

  ws.on('error', (error) => {
    console.error(`⚠️  WebSocket error for ${clientId}:`, error);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  wss.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});
