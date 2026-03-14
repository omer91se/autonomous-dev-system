import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const RUNNING_APPS_FILE = path.join(process.cwd(), '..', 'running-apps.json');

function loadRunningApps() {
  if (fs.existsSync(RUNNING_APPS_FILE)) {
    return JSON.parse(fs.readFileSync(RUNNING_APPS_FILE, 'utf-8'));
  }
  return {};
}

function isProcessRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const runningApps = loadRunningApps();
    const appRuntime = runningApps[id];

    if (!appRuntime) {
      return NextResponse.json({ running: false });
    }

    // Check if process is still alive
    if (!isProcessRunning(appRuntime.pid)) {
      return NextResponse.json({ running: false });
    }

    return NextResponse.json({
      running: true,
      pid: appRuntime.pid,
      port: appRuntime.port,
      startedAt: appRuntime.startedAt,
      uptime: Math.floor((Date.now() - new Date(appRuntime.startedAt).getTime()) / 1000)
    });
  } catch (error: any) {
    console.error('Get app status error:', error);
    return NextResponse.json(
      { error: 'Failed to get app status', details: error.message },
      { status: 500 }
    );
  }
}
