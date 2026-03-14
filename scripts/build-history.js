#!/usr/bin/env node

/**
 * Build History Manager
 *
 * Saves and retrieves build session data including agents and logs
 */

import fs from 'fs';
import path from 'path';

const HISTORY_DIR = path.join(process.cwd(), 'build-history');
const CURRENT_BUILD_FILE = path.join(HISTORY_DIR, '.current-build');

function ensureHistoryDir() {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

function generateBuildId() {
  return `build-${Date.now()}`;
}

function saveBuildSession(buildId, data) {
  ensureHistoryDir();
  const filePath = path.join(HISTORY_DIR, `${buildId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

function updateBuildSession(buildId, updates) {
  ensureHistoryDir();
  const filePath = path.join(HISTORY_DIR, `${buildId}.json`);

  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Merge updates
  Object.assign(data, updates);

  // Update timestamp
  data.updatedAt = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
}

function addAgentToSession(buildId, agent) {
  ensureHistoryDir();
  const filePath = path.join(HISTORY_DIR, `${buildId}.json`);

  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  if (!data.agents) {
    data.agents = [];
  }

  // Update existing agent or add new one
  const index = data.agents.findIndex(a => a.id === agent.id);
  if (index >= 0) {
    data.agents[index] = agent;
  } else {
    data.agents.push(agent);
  }

  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
}

function addLogToSession(buildId, log) {
  ensureHistoryDir();
  const filePath = path.join(HISTORY_DIR, `${buildId}.json`);

  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  if (!data.logs) {
    data.logs = [];
  }

  data.logs.push(log);
  data.updatedAt = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
}

function getBuildSession(buildId) {
  const filePath = path.join(HISTORY_DIR, `${buildId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function listBuildSessions() {
  ensureHistoryDir();

  const files = fs.readdirSync(HISTORY_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const filePath = path.join(HISTORY_DIR, f);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return {
        buildId: data.buildId || f.replace('.json', ''),
        projectName: data.projectName || 'Unknown Project',
        status: data.status || 'unknown',
        phase: data.phase,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        agentCount: (data.agents || []).length,
        logCount: (data.logs || []).length,
      };
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return files;
}

function deleteBuildSession(buildId) {
  const filePath = path.join(HISTORY_DIR, `${buildId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function getCurrentBuildId() {
  ensureHistoryDir();
  if (fs.existsSync(CURRENT_BUILD_FILE)) {
    return fs.readFileSync(CURRENT_BUILD_FILE, 'utf-8').trim();
  }
  return null;
}

function setCurrentBuildId(buildId) {
  ensureHistoryDir();
  fs.writeFileSync(CURRENT_BUILD_FILE, buildId);
}

function clearCurrentBuildId() {
  if (fs.existsSync(CURRENT_BUILD_FILE)) {
    fs.unlinkSync(CURRENT_BUILD_FILE);
  }
}

// CLI commands
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'list':
      const sessions = listBuildSessions();
      console.log(JSON.stringify(sessions, null, 2));
      break;

    case 'get':
      const buildId = process.argv[3];
      if (!buildId) {
        console.error('Usage: build-history.js get <buildId>');
        process.exit(1);
      }
      const session = getBuildSession(buildId);
      console.log(JSON.stringify(session, null, 2));
      break;

    case 'delete':
      const deleteId = process.argv[3];
      if (!deleteId) {
        console.error('Usage: build-history.js delete <buildId>');
        process.exit(1);
      }
      const deleted = deleteBuildSession(deleteId);
      console.log(deleted ? 'Deleted' : 'Not found');
      break;

    default:
      console.log('Usage: build-history.js <command>');
      console.log('Commands:');
      console.log('  list - List all build sessions');
      console.log('  get <buildId> - Get a specific build session');
      console.log('  delete <buildId> - Delete a build session');
  }
}

export {
  generateBuildId,
  saveBuildSession,
  updateBuildSession,
  addAgentToSession,
  addLogToSession,
  getBuildSession,
  listBuildSessions,
  deleteBuildSession,
  getCurrentBuildId,
  setCurrentBuildId,
  clearCurrentBuildId,
};
