#!/usr/bin/env tsx

/**
 * Autonomous Dev System Orchestrator
 *
 * This orchestrator coordinates Claude Code agents to autonomously build applications.
 * It manages workflow state and presents checkpoints for human approval.
 *
 * Usage: Run this through Claude Code
 *   User: "Run the autonomous dev system with my app idea: [idea]"
 *   Claude Code will execute this script and spawn specialized agents
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';
import { WebSocket } from 'ws';
import {
  generateBuildId,
  saveBuildSession,
  updateBuildSession,
  addAgentToSession,
  addLogToSession
} from './scripts/build-history.js';

// WebSocket connection to UI
const WS_PORT = process.env.WS_PORT || 3001;
let ws: WebSocket | null = null;
let currentBuildId: string | null = null;

// Connect to UI WebSocket server
function connectToUI() {
  try {
    ws = new WebSocket(`ws://localhost:${WS_PORT}`);

    ws.on('open', () => {
      console.log('✅ Connected to UI for real-time visualization');
      sendLog('info', 'Orchestrator connected to UI');
    });

    ws.on('error', (error) => {
      console.log('⚠️  UI not available (running in terminal-only mode)');
      ws = null;
    });

    ws.on('close', () => {
      console.log('🔌 UI connection closed');
      ws = null;
    });
  } catch (error) {
    console.log('⚠️  UI not available (running in terminal-only mode)');
    ws = null;
  }
}

// Send log message to UI
function sendLog(level: 'info' | 'success' | 'warning' | 'error', message: string, agent?: string) {
  console.log(`[${level.toUpperCase()}] ${agent ? `[${agent}] ` : ''}${message}`);

  // Save to build history
  if (currentBuildId) {
    addLogToSession(currentBuildId, { level, message, agent, timestamp: new Date().toISOString() });
  }

  // Send to UI
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'log',
      data: { level, message, agent, timestamp: new Date().toISOString() },
    }));
  }
}

// Send agent update to UI
function sendAgentUpdate(agent: any) {
  // Save to build history
  if (currentBuildId) {
    addAgentToSession(currentBuildId, agent);
  }

  // Send via WebSocket
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'agent_update',
      data: agent,
    }));
  }
}

// Send checkpoint to UI
function sendCheckpoint(checkpoint: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'checkpoint',
      data: checkpoint,
    }));
  }
}

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
  }>;
  createdAt: string;
}

const OUTPUT_DIR = join(process.cwd(), 'output');
const STATE_FILE = join(OUTPUT_DIR, 'project-state.json');

function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
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
    createdAt: new Date().toISOString()
  };

  saveState(state);
  return state;
}

function saveState(state: ProjectState) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function displayBanner() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           AUTONOMOUS DEV SYSTEM - Claude Code Agent Edition               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function checkpoint(type: string, artifactPath: string): Promise<boolean> {
  console.log('\n' + '='.repeat(80));
  console.log(`🔔 CHECKPOINT: ${type}`);
  console.log('='.repeat(80) + '\n');

  if (existsSync(artifactPath)) {
    const content = readFileSync(artifactPath, 'utf-8');
    console.log('📋 Artifact Preview:');
    console.log(content.slice(0, 1000) + (content.length > 1000 ? '...\n(truncated)' : ''));
  }

  console.log('\n' + '-'.repeat(80));
  console.log('Options: [1] Approve  [2] Reject  [3] View Full');
  console.log('-'.repeat(80));

  const choice = await prompt('\nYour choice (1-3): ');

  if (choice === '3') {
    if (existsSync(artifactPath)) {
      const content = readFileSync(artifactPath, 'utf-8');
      console.log('\n' + content + '\n');
    }
    return checkpoint(type, artifactPath);
  }

  return choice === '1';
}

async function main() {
  displayBanner();

  // Connect to UI
  connectToUI();
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for connection

  console.log('This orchestrator coordinates Claude Code agents to build your application.\n');
  console.log('INSTRUCTIONS FOR CLAUDE CODE:');
  console.log('1. When this script requests an agent, use the Task tool to spawn it');
  console.log('2. Pass the appropriate prompt file from ./agents/ directory');
  console.log('3. Wait for agent to complete and save output to ./output/ directory');
  console.log('4. Present checkpoint to user for approval');
  console.log('5. Proceed to next phase based on approval\n');
  console.log('─'.repeat(80) + '\n');

  const userInput = process.argv[2] || await prompt('💡 Describe your app idea: ');

  if (!userInput.trim()) {
    console.log('❌ No input provided. Exiting...');
    process.exit(1);
  }

  const state = loadOrCreateState(userInput);

  // Initialize build session
  currentBuildId = generateBuildId();
  saveBuildSession(currentBuildId, {
    buildId: currentBuildId,
    projectId: state.projectId,
    projectName: userInput,
    phase: state.phase,
    status: 'running',
    startedAt: new Date().toISOString(),
    agents: [],
    logs: [],
  });

  sendLog('info', `Starting build for: ${userInput}`);

  console.log(`\n📊 Project ID: ${state.projectId}`);
  console.log(`📍 Current Phase: ${state.phase}\n`);

  // Phase 1: Requirements
  if (state.phase === 'init' || state.phase === 'requirements') {
    console.log('═'.repeat(80));
    console.log('PHASE 1: REQUIREMENTS GATHERING');
    console.log('═'.repeat(80) + '\n');

    // Send agent start update to UI
    const reqAgentId = `agent-requirements-${Date.now()}`;
    sendAgentUpdate({
      id: reqAgentId,
      name: 'Requirements Agent',
      type: 'requirements',
      status: 'running',
      currentTask: 'Analyzing app idea and generating comprehensive requirements',
      progress: 0,
      startedAt: new Date().toISOString(),
    });
    sendLog('info', 'Requirements Agent started', 'Requirements Agent');

    console.log('🤖 CLAUDE CODE: Please spawn Requirements Agent');
    console.log('   - Use Task tool with subagent_type="general-purpose"');
    console.log('   - Provide prompt from: ./agents/requirements-agent-prompt.md');
    console.log('   - Replace {{USER_INPUT}} with:', userInput);
    console.log('   - Agent should create: ./output/requirements.json (or questions.json)\n');
    console.log('⏸️  Waiting for agent to complete...\n');

    // This is where Claude Code would spawn the agent
    // For now, we pause here and wait for manual execution

    console.log('Once requirements agent completes:');
    console.log('1. If questions.json exists → Answer questions → Re-run agent');
    console.log('2. If requirements.json exists → Present checkpoint\n');

    const requirementsPath = join(OUTPUT_DIR, 'requirements.json');
    if (existsSync(requirementsPath)) {
      // Update agent as completed
      sendAgentUpdate({
        id: reqAgentId,
        name: 'Requirements Agent',
        type: 'requirements',
        status: 'completed',
        currentTask: 'Requirements generated successfully',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      sendLog('success', 'Requirements generated successfully', 'Requirements Agent');

      const approved = await checkpoint('Requirements Review', requirementsPath);

      if (approved) {
        console.log('✅ Requirements approved!\n');
        state.phase = 'design';
        state.requirementsPath = requirementsPath;
        saveState(state);

        // Update build session phase
        if (currentBuildId) {
          updateBuildSession(currentBuildId, { phase: 'design' });
        }
      } else {
        console.log('❌ Requirements rejected. Please revise.\n');
        process.exit(0);
      }
    } else {
      console.log('⏸️  Requirements not yet generated. Run requirements agent first.\n');
      process.exit(0);
    }
  }

  // Phase 2: Design (MVP: Simplified)
  if (state.phase === 'design') {
    console.log('\n═'.repeat(80));
    console.log('PHASE 2: DESIGN');
    console.log('═'.repeat(80) + '\n');
    console.log('ℹ️  MVP: Design phase simplified - using requirements directly for coding\n');
    sendLog('info', 'Skipping design phase (MVP simplification)');

    state.phase = 'development';
    saveState(state);

    // Update build session phase
    if (currentBuildId) {
      updateBuildSession(currentBuildId, { phase: 'development' });
    }
  }

  // Phase 3: Development
  if (state.phase === 'development') {
    console.log('\n═'.repeat(80));
    console.log('PHASE 3: DEVELOPMENT');
    console.log('═'.repeat(80) + '\n');

    // Send agent start update to UI
    const codingAgentId = `agent-coding-${Date.now()}`;
    sendAgentUpdate({
      id: codingAgentId,
      name: 'Coding Agent',
      type: 'coding',
      status: 'running',
      currentTask: 'Generating full-stack application code',
      progress: 0,
      startedAt: new Date().toISOString(),
    });
    sendLog('info', 'Coding Agent started', 'Coding Agent');

    console.log('🤖 CLAUDE CODE: Please spawn Coding Agent');
    console.log('   - Use Task tool with subagent_type="general-purpose"');
    console.log('   - Provide prompt from: ./agents/coding-agent-prompt.md');
    console.log('   - Agent should create: ./output/generated-project/');
    console.log('   - Agent should create: ./output/implementation.json\n');
    console.log('⏸️  Waiting for agent to complete...\n');

    const implementationPath = join(OUTPUT_DIR, 'implementation.json');
    if (existsSync(implementationPath)) {
      // Update agent as completed
      sendAgentUpdate({
        id: codingAgentId,
        name: 'Coding Agent',
        type: 'coding',
        status: 'completed',
        currentTask: 'Application code generated successfully',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      sendLog('success', 'Application generated successfully', 'Coding Agent');

      const approved = await checkpoint('Implementation Review', implementationPath);

      if (approved) {
        console.log('✅ Implementation approved!\n');
        state.phase = 'testing';
        state.implementationPath = implementationPath;
        saveState(state);

        // Update build session phase
        if (currentBuildId) {
          updateBuildSession(currentBuildId, { phase: 'testing' });
        }
      } else {
        console.log('❌ Implementation rejected. Please revise.\n');
        process.exit(0);
      }
    } else {
      console.log('⏸️  Implementation not yet generated. Run coding agent first.\n');
      process.exit(0);
    }
  }

  // Phase 4: Testing (MVP: Placeholder)
  if (state.phase === 'testing') {
    console.log('\n═'.repeat(80));
    console.log('PHASE 4: TESTING');
    console.log('═'.repeat(80) + '\n');

    // Send agent start update to UI
    const testingAgentId = `agent-testing-${Date.now()}`;
    sendAgentUpdate({
      id: testingAgentId,
      name: 'Testing Agent',
      type: 'testing',
      status: 'running',
      currentTask: 'Manual testing phase - awaiting user confirmation',
      progress: 50,
      startedAt: new Date().toISOString(),
    });
    sendLog('info', 'Testing phase started (manual)', 'Testing Agent');

    console.log('ℹ️  MVP: Testing phase not yet implemented\n');
    console.log('Manual testing steps:');
    console.log('1. cd output/generated-project');
    console.log('2. npm install');
    console.log('3. Set up .env file');
    console.log('4. npm run dev');
    console.log('5. Test the application manually\n');

    const proceed = await prompt('Have you tested the application? (y/n): ');
    if (proceed.toLowerCase() === 'y') {
      // Update agent as completed
      sendAgentUpdate({
        id: testingAgentId,
        name: 'Testing Agent',
        type: 'testing',
        status: 'completed',
        currentTask: 'Testing completed successfully',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      sendLog('success', 'Testing phase completed', 'Testing Agent');

      state.phase = 'deployment';
      saveState(state);

      // Update build session phase
      if (currentBuildId) {
        updateBuildSession(currentBuildId, { phase: 'deployment' });
      }
    } else {
      sendAgentUpdate({
        id: testingAgentId,
        name: 'Testing Agent',
        type: 'testing',
        status: 'error',
        currentTask: 'Testing incomplete - user cancelled',
        progress: 50,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        error: 'User indicated testing was not completed',
      });
      sendLog('warning', 'Testing phase cancelled by user', 'Testing Agent');
      process.exit(0);
    }
  }

  // Phase 5: Deployment (MVP: Placeholder)
  if (state.phase === 'deployment') {
    console.log('\n═'.repeat(80));
    console.log('PHASE 5: DEPLOYMENT');
    console.log('═'.repeat(80) + '\n');

    // Send agent start update to UI
    const deploymentAgentId = `agent-deployment-${Date.now()}`;
    sendAgentUpdate({
      id: deploymentAgentId,
      name: 'Deployment Agent',
      type: 'deployment',
      status: 'running',
      currentTask: 'Preparing deployment instructions',
      progress: 0,
      startedAt: new Date().toISOString(),
    });
    sendLog('info', 'Deployment phase started (manual)', 'Deployment Agent');

    console.log('ℹ️  MVP: Deployment phase not yet implemented\n');
    console.log('Manual deployment steps:');
    console.log('1. Create GitHub repository');
    console.log('2. Push code: git init && git add . && git commit -m "Initial"');
    console.log('3. Deploy to Vercel: npx vercel');
    console.log('4. Set up environment variables in Vercel dashboard\n');

    // Update agent as completed
    sendAgentUpdate({
      id: deploymentAgentId,
      name: 'Deployment Agent',
      type: 'deployment',
      status: 'completed',
      currentTask: 'Deployment instructions provided',
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    sendLog('success', 'Deployment phase completed', 'Deployment Agent');

    state.phase = 'complete';
    saveState(state);
  }

  if (state.phase === 'complete') {
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 PROJECT COMPLETE!');
    console.log('═'.repeat(80) + '\n');
    console.log('Your application has been generated in: output/generated-project/\n');
    console.log('Next steps:');
    console.log('1. Review the generated code');
    console.log('2. Set up your development environment');
    console.log('3. Deploy to production');
    console.log('4. Iterate and improve!\n');

    // Update build session as complete
    if (currentBuildId) {
      updateBuildSession(currentBuildId, {
        status: 'completed',
        phase: 'complete',
        completedAt: new Date().toISOString(),
      });
    }
    sendLog('success', 'Build completed successfully! 🎉');
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);

  // Update build session as failed
  if (currentBuildId) {
    updateBuildSession(currentBuildId, {
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: error.message,
    });
  }
  sendLog('error', `Build failed: ${error.message}`);

  process.exit(1);
});
