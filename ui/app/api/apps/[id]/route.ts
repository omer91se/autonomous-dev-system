import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const MANAGE_APPS_SCRIPT = path.join(process.cwd(), '..', 'scripts', 'manage-apps.js');
const REGISTRY_FILE = path.join(process.cwd(), '..', 'shared-infrastructure.json');

function loadRegistry() {
  if (fs.existsSync(REGISTRY_FILE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  }
  return { projects: [], nextPort: 3100 };
}

function saveRegistry(registry: any) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const registry = loadRegistry();
    const app = registry.projects.find((p: any) => p.id === id || p.name === id);

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app });
  } catch (error: any) {
    console.error('Get app error:', error);
    return NextResponse.json(
      { error: 'Failed to get app', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    let result;

    if (action === 'soft-delete') {
      const { stdout } = await execAsync(`node "${MANAGE_APPS_SCRIPT}" soft-delete ${id}`);
      result = JSON.parse(stdout);
    } else if (action === 'restore') {
      const { stdout } = await execAsync(`node "${MANAGE_APPS_SCRIPT}" restore ${id}`);
      result = JSON.parse(stdout);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Update app error:', error);
    return NextResponse.json(
      { error: 'Failed to update app', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Hard delete - requires confirmation
    const { stdout } = await execAsync(`node "${MANAGE_APPS_SCRIPT}" hard-delete ${id}`);
    const result = JSON.parse(stdout);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Delete app error:', error);
    return NextResponse.json(
      { error: 'Failed to delete app', details: error.message },
      { status: 500 }
    );
  }
}
