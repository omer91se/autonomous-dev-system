#!/usr/bin/env tsx

/**
 * Autonomous Dev System Orchestrator - UI Edition
 *
 * This orchestrator coordinates Claude Code agents and integrates with the UI
 * for real-time visualization and checkpoint management.
 *
 * Usage: tsx orchestrate-ui.ts "Your app idea"
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { WebSocket } from 'ws';

// Project state
interface ProjectState {
  projectId: string;
  phase: 'init' | 'requirements' | 'design' | 'development' | 'testing' | 'deployment' | 'complete';
  userInput: string;
  requirementsPath?: string;
  designPath?: string;
  implementationPath?: string;
  checkpoints: Array<{
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
    artifactPath?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

const OUTPUT_DIR = join(process.cwd(), 'output');
const STATE_FILE = join(OUTPUT_DIR, 'project-state.json');
const CHECKPOINT_DECISION_FILE = join(OUTPUT_DIR, 'checkpoint-decision.json');

let ws: WebSocket | null = null;

function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function connectWebSocket() {
  try {
    ws = new WebSocket('ws://localhost:3001');

    ws.on('open', () => {
      console.log('✅ Connected to UI');
      sendLog('info', 'Orchestrator connected to UI');
    });

    ws.on('error', (error) => {
      console.log('⚠️  UI not available (run `npm run dev` in ui/ directory)');
      ws = null;
    });

    ws.on('close', () => {
      console.log('❌ Disconnected from UI');
      ws = null;
    });
  } catch (error) {
    console.log('⚠️  Could not connect to UI');
    ws = null;
  }
}

function sendLog(level: 'info' | 'success' | 'warning' | 'error', message: string, agent?: string) {
  console.log(`[${level.toUpperCase()}] ${agent ? `[${agent}] ` : ''}${message}`);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'log',
      data: {
        level,
        message,
        agent,
        timestamp: new Date().toISOString(),
      },
    }));
  }
}

function sendAgentUpdate(agent: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'agent_update',
      data: agent,
    }));
  }
}

function sendCheckpoint(checkpoint: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'checkpoint',
      data: checkpoint,
    }));
  }
}

function loadOrCreateState(userInput: string): ProjectState {
  ensureOutputDir();

  if (existsSync(STATE_FILE)) {
    const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    console.log('📂 Resuming existing project:', state.projectId);
    return state;
  }

  const state: ProjectState = {
    projectId: `proj-${Date.now()}`,
    phase: 'init',
    userInput,
    checkpoints: [],
    createdAt: new Date().toISOString(),
  };

  saveState(state);
  return state;
}

function saveState(state: ProjectState) {
  state.updatedAt = new Date().toISOString();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function displayBanner() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║      AUTONOMOUS DEV SYSTEM - UI Edition with Claude Code Agents           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
}

async function waitForCheckpointDecision(checkpointId: string): Promise<boolean> {
  sendLog('info', 'Waiting for user decision in UI...');

  // Poll for checkpoint decision file
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (existsSync(CHECKPOINT_DECISION_FILE)) {
        try {
          const decision = JSON.parse(readFileSync(CHECKPOINT_DECISION_FILE, 'utf-8'));

          if (decision.checkpointId === checkpointId) {
            // Clear the decision file
            writeFileSync(CHECKPOINT_DECISION_FILE, '{}');

            if (decision.approved) {
              sendLog('success', `Checkpoint approved${decision.feedback ? ': ' + decision.feedback : ''}`);
            } else {
              sendLog('warning', `Checkpoint rejected${decision.feedback ? ': ' + decision.feedback : ''}`);
            }

            clearInterval(interval);
            resolve(decision.approved);
          }
        } catch (error) {
          // File not ready yet, continue polling
        }
      }
    }, 1000);

    // Timeout after 30 minutes
    setTimeout(() => {
      clearInterval(interval);
      sendLog('error', 'Checkpoint timeout - no decision received');
      resolve(false);
    }, 30 * 60 * 1000);
  });
}

async function main() {
  displayBanner();

  // Connect to UI WebSocket
  connectWebSocket();

  const userInput = process.argv[2];

  if (!userInput || !userInput.trim()) {
    console.log('❌ No input provided.');
    console.log('\nUsage: tsx orchestrate-ui.ts "Your app idea"\n');
    console.log('Example: tsx orchestrate-ui.ts "A todo list app with priorities"\n');
    process.exit(1);
  }

  const state = loadOrCreateState(userInput);

  console.log(`\n📊 Project ID: ${state.projectId}`);
  console.log(`📍 Current Phase: ${state.phase}`);
  console.log(`💡 App Idea: ${state.userInput}\n`);

  sendLog('info', `Starting new project: ${state.projectId}`);
  sendLog('info', `App idea: ${state.userInput}`);

  // Phase 1: Requirements
  if (state.phase === 'init') {
    state.phase = 'requirements';
    saveState(state);

    console.log('═'.repeat(80));
    console.log('PHASE 1: REQUIREMENTS GATHERING');
    console.log('═'.repeat(80) + '\n');

    sendLog('info', 'Starting requirements gathering phase', 'Orchestrator');

    const agentId = `agent-requirements-${Date.now()}`;
    sendAgentUpdate({
      id: agentId,
      name: 'Requirements Agent',
      type: 'requirements',
      status: 'running',
      currentTask: 'Analyzing app idea and generating specifications',
      progress: 0,
      startedAt: new Date().toISOString(),
    });

    console.log('🤖 Ready for Claude Code to spawn Requirements Agent');
    console.log('   The agent should:');
    console.log('   1. Analyze the user input');
    console.log('   2. Generate comprehensive requirements');
    console.log('   3. Save to ./output/requirements.json\n');

    sendLog('info', 'Waiting for requirements agent to complete...', 'Requirements Agent');

    // Simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        sendAgentUpdate({
          id: agentId,
          name: 'Requirements Agent',
          type: 'requirements',
          status: 'running',
          currentTask: 'Analyzing app idea and generating specifications',
          progress,
          startedAt: new Date().toISOString(),
        });
      }
    }, 3000);

    // Wait for requirements.json to be created
    console.log('⏳ Waiting for ./output/requirements.json...\n');

    const requirementsPath = join(OUTPUT_DIR, 'requirements.json');
    while (!existsSync(requirementsPath)) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    clearInterval(progressInterval);

    sendAgentUpdate({
      id: agentId,
      name: 'Requirements Agent',
      type: 'requirements',
      status: 'completed',
      currentTask: 'Requirements generated successfully',
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    sendLog('success', 'Requirements generated successfully', 'Requirements Agent');

    // Create checkpoint
    const checkpointId = `checkpoint-requirements-${Date.now()}`;
    const checkpoint = {
      id: checkpointId,
      type: 'Requirements Review',
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
      artifactPath: 'requirements.json',
    };

    state.checkpoints.push(checkpoint);
    state.requirementsPath = requirementsPath;
    saveState(state);

    console.log('\n🔔 CHECKPOINT: Requirements Review');
    console.log('   Please review in the UI and approve/reject\n');

    sendCheckpoint(checkpoint);

    const approved = await waitForCheckpointDecision(checkpointId);

    if (approved) {
      checkpoint.status = 'approved';
      state.phase = 'development'; // Skip design for MVP
      saveState(state);
      console.log('✅ Requirements approved! Moving to development phase.\n');
    } else {
      checkpoint.status = 'rejected';
      saveState(state);
      console.log('❌ Requirements rejected. Please revise and re-run.\n');
      process.exit(0);
    }
  }

  // Phase 3: Development (skipping design for MVP)
  if (state.phase === 'development') {
    console.log('═'.repeat(80));
    console.log('PHASE 3: DEVELOPMENT');
    console.log('═'.repeat(80) + '\n');

    sendLog('info', 'Starting development phase', 'Orchestrator');

    console.log('🤖 Ready for Claude Code to spawn Coding Agent');
    console.log('   The agent should:');
    console.log('   1. Read requirements from ./output/requirements.json');
    console.log('   2. Generate complete application');
    console.log('   3. Save to ./output/generated-project/');
    console.log('   4. Create ./output/implementation.json summary\n');

    console.log('⏳ Waiting for implementation to complete...\n');

    sendLog('info', 'Waiting for coding agent to complete...', 'Coding Agent');

    const implementationPath = join(OUTPUT_DIR, 'implementation.json');
    while (!existsSync(implementationPath)) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    sendLog('success', 'Implementation completed', 'Coding Agent');

    state.phase = 'complete';
    state.implementationPath = implementationPath;
    saveState(state);
  }

  if (state.phase === 'complete') {
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 PROJECT COMPLETE!');
    console.log('═'.repeat(80) + '\n');
    console.log('Your application: ./output/generated-project/\n');

    sendLog('success', 'Project completed successfully!', 'Orchestrator');
  }

  // Close WebSocket
  if (ws) {
    ws.close();
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  sendLog('error', error.message, 'Orchestrator');
  process.exit(1);
});
