import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const BUILD_HISTORY_SCRIPT = path.join(process.cwd(), '..', 'scripts', 'build-history.js');

export async function GET() {
  try {
    // Call build-history.js to list all builds
    const { stdout } = await execAsync(`node "${BUILD_HISTORY_SCRIPT}" list`);
    const builds = JSON.parse(stdout);

    return NextResponse.json({ builds });
  } catch (error: any) {
    console.error('Builds API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch builds', details: error.message },
      { status: 500 }
    );
  }
}
