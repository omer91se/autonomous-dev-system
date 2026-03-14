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

  console.log(`\n📊 Project ID: ${state.projectId}`);
  console.log(`📍 Current Phase: ${state.phase}\n`);

  // Phase 1: Requirements
  if (state.phase === 'init' || state.phase === 'requirements') {
    console.log('═'.repeat(80));
    console.log('PHASE 1: REQUIREMENTS GATHERING');
    console.log('═'.repeat(80) + '\n');

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
      const approved = await checkpoint('Requirements Review', requirementsPath);

      if (approved) {
        console.log('✅ Requirements approved!\n');
        state.phase = 'design';
        state.requirementsPath = requirementsPath;
        saveState(state);
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
    state.phase = 'development';
    saveState(state);
  }

  // Phase 3: Development
  if (state.phase === 'development') {
    console.log('\n═'.repeat(80));
    console.log('PHASE 3: DEVELOPMENT');
    console.log('═'.repeat(80) + '\n');

    console.log('🤖 CLAUDE CODE: Please spawn Coding Agent');
    console.log('   - Use Task tool with subagent_type="general-purpose"');
    console.log('   - Provide prompt from: ./agents/coding-agent-prompt.md');
    console.log('   - Agent should create: ./output/generated-project/');
    console.log('   - Agent should create: ./output/implementation.json\n');
    console.log('⏸️  Waiting for agent to complete...\n');

    const implementationPath = join(OUTPUT_DIR, 'implementation.json');
    if (existsSync(implementationPath)) {
      const approved = await checkpoint('Implementation Review', implementationPath);

      if (approved) {
        console.log('✅ Implementation approved!\n');
        state.phase = 'testing';
        state.implementationPath = implementationPath;
        saveState(state);
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
    console.log('ℹ️  MVP: Testing phase not yet implemented\n');
    console.log('Manual testing steps:');
    console.log('1. cd output/generated-project');
    console.log('2. npm install');
    console.log('3. Set up .env file');
    console.log('4. npm run dev');
    console.log('5. Test the application manually\n');

    const proceed = await prompt('Have you tested the application? (y/n): ');
    if (proceed.toLowerCase() === 'y') {
      state.phase = 'deployment';
      saveState(state);
    } else {
      process.exit(0);
    }
  }

  // Phase 5: Deployment (MVP: Placeholder)
  if (state.phase === 'deployment') {
    console.log('\n═'.repeat(80));
    console.log('PHASE 5: DEPLOYMENT');
    console.log('═'.repeat(80) + '\n');
    console.log('ℹ️  MVP: Deployment phase not yet implemented\n');
    console.log('Manual deployment steps:');
    console.log('1. Create GitHub repository');
    console.log('2. Push code: git init && git add . && git commit -m "Initial"');
    console.log('3. Deploy to Vercel: npx vercel');
    console.log('4. Set up environment variables in Vercel dashboard\n');

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
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
