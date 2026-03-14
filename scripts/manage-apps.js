#!/usr/bin/env node

/**
 * App Management Script
 *
 * Handles all app lifecycle operations:
 * - List apps (active, deleted, all)
 * - Start app
 * - Stop app
 * - Soft delete (mark as deleted)
 * - Restore (undelete)
 * - Hard delete (complete removal)
 *
 * Usage: node scripts/manage-apps.js [command] [args]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';
import * as processManager from './process-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use script directory to find project root (one level up from scripts/)
const PROJECT_ROOT = path.join(__dirname, '..');
const REGISTRY_FILE = path.join(PROJECT_ROOT, 'shared-infrastructure.json');
const PROJECTS_DIR = path.join(PROJECT_ROOT, 'projects');

function loadRegistry() {
  if (fs.existsSync(REGISTRY_FILE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  }
  return { projects: [], nextPort: 3100 };
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

function listApps(status = 'active') {
  const registry = loadRegistry();
  let apps = registry.projects || [];

  // Filter by status
  if (status !== 'all') {
    apps = apps.filter(app => app.status === status);
  }

  // Add running status
  const runningApps = processManager.getAllRunningApps();
  apps = apps.map(app => ({
    ...app,
    running: !!runningApps[app.name],
    runtimeInfo: runningApps[app.name] || null
  }));

  return apps;
}

function getApp(nameOrId) {
  const registry = loadRegistry();
  const app = registry.projects.find(
    p => p.name === nameOrId || p.id === nameOrId
  );

  if (!app) {
    throw new Error(`App not found: ${nameOrId}`);
  }

  // Add running status
  const status = processManager.getAppStatus(app.name);
  return {
    ...app,
    running: status.running,
    runtimeInfo: status.running ? status : null
  };
}

async function startApp(nameOrId) {
  const app = getApp(nameOrId);

  // Check if already running
  const status = processManager.getAppStatus(app.name);
  if (status.running) {
    return {
      success: true,
      alreadyRunning: true,
      port: app.port,
      url: `http://localhost:${app.port}`,
      pid: status.pid
    };
  }

  // Check if port is available
  if (processManager.isPortInUse(app.port)) {
    const pid = processManager.getPidOnPort(app.port);
    throw new Error(
      `Port ${app.port} is already in use by process ${pid}. ` +
      `Please stop that process first or assign a different port.`
    );
  }

  const appPath = path.join(process.cwd(), app.path);

  // Check if project exists
  if (!fs.existsSync(appPath)) {
    throw new Error(`Project directory not found: ${app.path}`);
  }

  // Check if node_modules exists
  const nodeModulesPath = path.join(appPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies (first time)...');
    execSync('npm install', { cwd: appPath, stdio: 'inherit' });
  }

  console.log(`🚀 Starting ${app.displayName} on port ${app.port}...`);

  // Start the app in background
  const child = spawn('npm', ['run', 'dev', '--', '-p', app.port.toString()], {
    cwd: appPath,
    detached: true,
    stdio: 'ignore'
  });

  child.unref();

  // Register the process
  processManager.registerApp(app.name, child.pid, app.port);

  // Update lastStartedAt
  const registry = loadRegistry();
  const appEntry = registry.projects.find(p => p.id === app.id);
  if (appEntry) {
    appEntry.lastStartedAt = new Date().toISOString();
    saveRegistry(registry);
  }

  // Wait a bit for the server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  return {
    success: true,
    alreadyRunning: false,
    port: app.port,
    url: `http://localhost:${app.port}`,
    pid: child.pid
  };
}

function stopApp(nameOrId) {
  const app = getApp(nameOrId);

  const status = processManager.getAppStatus(app.name);
  if (!status.running) {
    return {
      success: true,
      wasRunning: false,
      message: 'App was not running'
    };
  }

  console.log(`🛑 Stopping ${app.displayName}...`);

  // Kill the process
  try {
    process.kill(status.pid, 'SIGTERM');

    // Wait a bit for graceful shutdown
    setTimeout(() => {
      // Force kill if still running
      if (processManager.isProcessRunning(status.pid)) {
        process.kill(status.pid, 'SIGKILL');
      }
    }, 2000);
  } catch (error) {
    // Process might already be dead
  }

  // Unregister
  processManager.unregisterApp(app.name);

  return {
    success: true,
    wasRunning: true,
    message: 'App stopped successfully'
  };
}

function softDeleteApp(nameOrId) {
  const registry = loadRegistry();
  const app = registry.projects.find(
    p => p.name === nameOrId || p.id === nameOrId
  );

  if (!app) {
    throw new Error(`App not found: ${nameOrId}`);
  }

  if (app.status === 'deleted') {
    throw new Error('App is already deleted');
  }

  // Stop app if running
  const status = processManager.getAppStatus(app.name);
  if (status.running) {
    console.log('🛑 Stopping app first...');
    stopApp(nameOrId);
  }

  // Mark as deleted
  app.status = 'deleted';
  app.deletedAt = new Date().toISOString();

  saveRegistry(registry);

  console.log(`🗑️  ${app.displayName} moved to deleted apps`);

  return {
    success: true,
    app
  };
}

function restoreApp(nameOrId) {
  const registry = loadRegistry();
  const app = registry.projects.find(
    p => p.name === nameOrId || p.id === nameOrId
  );

  if (!app) {
    throw new Error(`App not found: ${nameOrId}`);
  }

  if (app.status !== 'deleted') {
    throw new Error('App is not deleted');
  }

  // Restore
  app.status = 'active';
  app.deletedAt = null;

  saveRegistry(registry);

  console.log(`✅ ${app.displayName} restored to active apps`);

  return {
    success: true,
    app
  };
}

async function hardDeleteApp(nameOrId) {
  const registry = loadRegistry();
  const appIndex = registry.projects.findIndex(
    p => p.name === nameOrId || p.id === nameOrId
  );

  if (appIndex === -1) {
    throw new Error(`App not found: ${nameOrId}`);
  }

  const app = registry.projects[appIndex];

  console.log(`⚠️  Hard deleting ${app.displayName}...`);
  console.log('This will remove:');
  console.log('  - Local files');
  console.log('  - Database');
  console.log('  - S3 bucket and files');
  console.log('  - Registry entry\n');

  // Stop app if running
  const status = processManager.getAppStatus(app.name);
  if (status.running) {
    console.log('🛑 Stopping app...');
    stopApp(nameOrId);
  }

  // Delete local files
  const appPath = path.join(process.cwd(), app.path);
  if (fs.existsSync(appPath)) {
    console.log('📁 Deleting local files...');
    execSync(`rm -rf "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Files deleted');
  }

  // Delete database
  if (app.database) {
    console.log(`🗄️  Deleting database: ${app.database}...`);
    try {
      // Read database credentials from .env.shared
      const envSharedPath = path.join(process.cwd(), '.env.shared');
      if (fs.existsSync(envSharedPath)) {
        const envContent = fs.readFileSync(envSharedPath, 'utf-8');
        const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1];

        if (dbUrl) {
          // Use psql to drop database
          const dbName = app.database;
          execSync(
            `psql "${dbUrl}" -c "DROP DATABASE IF EXISTS ${dbName};"`,
            { stdio: 'inherit' }
          );
          console.log('✅ Database deleted');
        }
      }
    } catch (error) {
      console.error('⚠️  Warning: Could not delete database:', error.message);
      console.error('   You may need to delete it manually');
    }
  }

  // Delete S3 bucket
  if (app.s3Bucket) {
    console.log(`☁️  Deleting S3 bucket: ${app.s3Bucket}...`);
    try {
      // Read AWS credentials from .env.shared
      const envSharedPath = path.join(process.cwd(), '.env.shared');
      if (fs.existsSync(envSharedPath)) {
        const envContent = fs.readFileSync(envSharedPath, 'utf-8');
        const accessKey = envContent.match(/AWS_ACCESS_KEY_ID=(.+)/)?.[1];
        const secretKey = envContent.match(/AWS_SECRET_ACCESS_KEY=(.+)/)?.[1];
        const region = app.s3Region || 'us-east-1';

        if (accessKey && secretKey) {
          // Use AWS CLI to delete bucket
          const env = {
            ...process.env,
            AWS_ACCESS_KEY_ID: accessKey,
            AWS_SECRET_ACCESS_KEY: secretKey,
            AWS_DEFAULT_REGION: region
          };

          // Delete all objects first
          try {
            execSync(
              `aws s3 rm s3://${app.s3Bucket} --recursive`,
              { env, stdio: 'inherit' }
            );
          } catch (e) {
            // Bucket might be empty or not exist
          }

          // Delete bucket
          try {
            execSync(
              `aws s3 rb s3://${app.s3Bucket}`,
              { env, stdio: 'inherit' }
            );
            console.log('✅ S3 bucket deleted');
          } catch (e) {
            console.error('⚠️  Warning: Could not delete S3 bucket:', e.message);
          }
        }
      }
    } catch (error) {
      console.error('⚠️  Warning: Could not delete S3 bucket:', error.message);
      console.error('   You may need to delete it manually via AWS console');
    }
  }

  // Remove from registry
  console.log('📝 Removing from registry...');
  registry.projects.splice(appIndex, 1);
  saveRegistry(registry);
  console.log('✅ Removed from registry');

  console.log(`\n✅ ${app.displayName} has been permanently deleted`);

  return {
    success: true,
    deletedApp: app
  };
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];

  (async () => {
    try {
      switch (command) {
        case 'list':
          const status = arg || 'active';
          const apps = listApps(status);
          console.log(JSON.stringify(apps, null, 2));
          break;

        case 'start':
          if (!arg) {
            console.error('Usage: node manage-apps.js start <app-name>');
            process.exit(1);
          }
          const startResult = await startApp(arg);
          console.log(startResult);
          break;

        case 'stop':
          if (!arg) {
            console.error('Usage: node manage-apps.js stop <app-name>');
            process.exit(1);
          }
          const stopResult = stopApp(arg);
          console.log(stopResult);
          break;

        case 'soft-delete':
          if (!arg) {
            console.error('Usage: node manage-apps.js soft-delete <app-name>');
            process.exit(1);
          }
          const softResult = softDeleteApp(arg);
          console.log(softResult);
          break;

        case 'restore':
          if (!arg) {
            console.error('Usage: node manage-apps.js restore <app-name>');
            process.exit(1);
          }
          const restoreResult = restoreApp(arg);
          console.log(restoreResult);
          break;

        case 'hard-delete':
          if (!arg) {
            console.error('Usage: node manage-apps.js hard-delete <app-name>');
            process.exit(1);
          }
          const hardResult = await hardDeleteApp(arg);
          console.log(hardResult);
          break;

        default:
          console.log('Usage: node manage-apps.js <command> [args]');
          console.log('Commands:');
          console.log('  list [status]        - List apps (active|deleted|all)');
          console.log('  start <name>         - Start an app');
          console.log('  stop <name>          - Stop an app');
          console.log('  soft-delete <name>   - Mark app as deleted');
          console.log('  restore <name>       - Restore deleted app');
          console.log('  hard-delete <name>   - Permanently delete app');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

export {
  listApps,
  getApp,
  startApp,
  stopApp,
  softDeleteApp,
  restoreApp,
  hardDeleteApp
};
