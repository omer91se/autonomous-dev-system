#!/usr/bin/env node

/**
 * Process Manager
 *
 * Tracks running app processes (PIDs, ports, etc.)
 * Saves state to running-apps.json
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RUNNING_APPS_FILE = path.join(process.cwd(), 'running-apps.json');

function loadRunningApps() {
  if (fs.existsSync(RUNNING_APPS_FILE)) {
    return JSON.parse(fs.readFileSync(RUNNING_APPS_FILE, 'utf-8'));
  }
  return {};
}

function saveRunningApps(apps) {
  fs.writeFileSync(RUNNING_APPS_FILE, JSON.stringify(apps, null, 2));
}

function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    // Send signal 0 to check if process exists
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function isPortInUse(port) {
  try {
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
    return result.length > 0;
  } catch (error) {
    return false;
  }
}

function getPidOnPort(port) {
  try {
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
    return result ? parseInt(result.split('\n')[0]) : null;
  } catch (error) {
    return null;
  }
}

function registerApp(appName, pid, port) {
  const apps = loadRunningApps();
  apps[appName] = {
    pid,
    port,
    startedAt: new Date().toISOString()
  };
  saveRunningApps(apps);
}

function unregisterApp(appName) {
  const apps = loadRunningApps();
  delete apps[appName];
  saveRunningApps(apps);
}

function getAppStatus(appName) {
  const apps = loadRunningApps();
  const app = apps[appName];

  if (!app) {
    return { running: false };
  }

  // Check if process is still running
  if (!isProcessRunning(app.pid)) {
    // Process died, clean up
    unregisterApp(appName);
    return { running: false };
  }

  // Check if port is still in use
  if (!isPortInUse(app.port)) {
    // Port not in use, process might have died
    unregisterApp(appName);
    return { running: false };
  }

  return {
    running: true,
    pid: app.pid,
    port: app.port,
    startedAt: app.startedAt,
    uptime: Math.floor((Date.now() - new Date(app.startedAt).getTime()) / 1000)
  };
}

function getAllRunningApps() {
  const apps = loadRunningApps();
  const result = {};

  for (const [appName, data] of Object.entries(apps)) {
    const status = getAppStatus(appName);
    if (status.running) {
      result[appName] = status;
    }
  }

  // Save cleaned up state
  saveRunningApps(result);
  return result;
}

function cleanupDeadProcesses() {
  const apps = loadRunningApps();
  const alive = {};

  for (const [appName, data] of Object.entries(apps)) {
    if (isProcessRunning(data.pid)) {
      alive[appName] = data;
    }
  }

  saveRunningApps(alive);
  return Object.keys(apps).length - Object.keys(alive).length;
}

export {
  registerApp,
  unregisterApp,
  getAppStatus,
  getAllRunningApps,
  isPortInUse,
  getPidOnPort,
  cleanupDeadProcesses
};
