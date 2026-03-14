import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const MANAGE_APPS_SCRIPT = path.join(process.cwd(), '..', 'scripts', 'manage-apps.js');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`Starting app: ${id}`);

    // Call manage-apps.js to start the app
    const { stdout } = await execAsync(`node "${MANAGE_APPS_SCRIPT}" start ${id}`);
    const result = JSON.parse(stdout);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Start app error:', error);
    return NextResponse.json(
      { error: 'Failed to start app', details: error.message },
      { status: 500 }
    );
  }
}
