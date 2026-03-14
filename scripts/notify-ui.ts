#!/usr/bin/env tsx

/**
 * Simple utility to send agent updates to the UI WebSocket server
 * Usage: tsx scripts/notify-ui.ts <command> [options]
 */

import { WebSocket } from 'ws';
import {
  generateBuildId,
  saveBuildSession,
  updateBuildSession,
  addAgentToSession,
  addLogToSession,
  getCurrentBuildId,
  setCurrentBuildId
} from './build-history.js';

const WS_PORT = process.env.WS_PORT || 3001;

interface AgentUpdate {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'completed' | 'error';
  currentTask: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

async function sendToUI(type: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

    ws.on('open', () => {
      ws.send(JSON.stringify({ type, data }));
      ws.close();
      resolve();
    });

    ws.on('error', (error) => {
      // UI not available - that's okay, we still save to history
      resolve();
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      ws.close();
      resolve();
    }, 2000);
  });
}

async function startAgent(agentName: string, agentType: string, task: string) {
  const agentId = `agent-${agentType}-${Date.now()}`;

  const agent: AgentUpdate = {
    id: agentId,
    name: agentName,
    type: agentType,
    status: 'running',
    currentTask: task,
    progress: 0,
    startedAt: new Date().toISOString(),
  };

  // Get or create current build session
  let buildId = getCurrentBuildId();
  if (!buildId) {
    buildId = generateBuildId();
    setCurrentBuildId(buildId);
    saveBuildSession(buildId, {
      buildId,
      projectId: `cli-${Date.now()}`,
      projectName: 'CLI Build',
      phase: agentType,
      status: 'running',
      startedAt: new Date().toISOString(),
      agents: [],
      logs: [],
    });
  }

  // Save to build history
  addAgentToSession(buildId, agent);
  addLogToSession(buildId, {
    level: 'info',
    message: `${agentName} started`,
    agent: agentName,
    timestamp: new Date().toISOString(),
  });

  // Send to UI
  await sendToUI('agent_update', agent);
  await sendToUI('log', {
    level: 'info',
    message: `${agentName} started`,
    agent: agentName,
    timestamp: new Date().toISOString(),
  });

  // Output just the agent ID for easy capture in bash
  console.log(agentId);
}

async function completeAgent(agentId: string, agentName: string, agentType: string, task: string) {
  const agent: AgentUpdate = {
    id: agentId,
    name: agentName,
    type: agentType,
    status: 'completed',
    currentTask: task,
    progress: 100,
    startedAt: new Date().toISOString(), // Would be better to track actual start time
    completedAt: new Date().toISOString(),
  };

  const buildId = getCurrentBuildId();
  if (buildId) {
    addAgentToSession(buildId, agent);
    addLogToSession(buildId, {
      level: 'success',
      message: `${agentName} completed successfully`,
      agent: agentName,
      timestamp: new Date().toISOString(),
    });
  }

  await sendToUI('agent_update', agent);
  await sendToUI('log', {
    level: 'success',
    message: `${agentName} completed successfully`,
    agent: agentName,
    timestamp: new Date().toISOString(),
  });
}

async function errorAgent(agentId: string, agentName: string, agentType: string, error: string) {
  const agent: AgentUpdate = {
    id: agentId,
    name: agentName,
    type: agentType,
    status: 'error',
    currentTask: `Failed: ${error}`,
    progress: 0,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    error,
  };

  const buildId = getCurrentBuildId();
  if (buildId) {
    addAgentToSession(buildId, agent);
    addLogToSession(buildId, {
      level: 'error',
      message: error,
      agent: agentName,
      timestamp: new Date().toISOString(),
    });
  }

  await sendToUI('agent_update', agent);
  await sendToUI('log', {
    level: 'error',
    message: error,
    agent: agentName,
    timestamp: new Date().toISOString(),
  });
}

async function sendLog(level: 'info' | 'success' | 'warning' | 'error', message: string, agent?: string) {
  const buildId = getCurrentBuildId();
  if (buildId) {
    addLogToSession(buildId, {
      level,
      message,
      agent,
      timestamp: new Date().toISOString(),
    });
  }

  await sendToUI('log', {
    level,
    message,
    agent,
    timestamp: new Date().toISOString(),
  });
}

// Parse command line arguments
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'start':
      // tsx scripts/notify-ui.ts start "CEO Agent" "ceo" "Analyzing business viability"
      await startAgent(args[0], args[1], args[2]);
      break;

    case 'complete':
      // tsx scripts/notify-ui.ts complete "agent-ceo-123" "CEO Agent" "ceo" "Business plan created"
      await completeAgent(args[0], args[1], args[2], args[3]);
      break;

    case 'error':
      // tsx scripts/notify-ui.ts error "agent-ceo-123" "CEO Agent" "ceo" "Failed to analyze market"
      await errorAgent(args[0], args[1], args[2], args[3]);
      break;

    case 'log':
      // tsx scripts/notify-ui.ts log "info" "Starting build process" "System"
      await sendLog(args[0] as any, args[1], args[2]);
      break;

    default:
      console.error('Unknown command. Usage:');
      console.error('  tsx scripts/notify-ui.ts start <agentName> <agentType> <task>');
      console.error('  tsx scripts/notify-ui.ts complete <agentId> <agentName> <agentType> <task>');
      console.error('  tsx scripts/notify-ui.ts error <agentId> <agentName> <agentType> <errorMsg>');
      console.error('  tsx scripts/notify-ui.ts log <level> <message> [agent]');
      process.exit(1);
  }
}

main().catch(console.error);
