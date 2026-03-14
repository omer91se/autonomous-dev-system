import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const MANAGE_APPS_SCRIPT = path.join(process.cwd(), '..', 'scripts', 'manage-apps.js');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';

    // Call manage-apps.js to list apps
    const { stdout } = await execAsync(`node "${MANAGE_APPS_SCRIPT}" list ${status}`);
    const apps = JSON.parse(stdout);

    return NextResponse.json({ apps });
  } catch (error: any) {
    console.error('Apps API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps', details: error.message },
      { status: 500 }
    );
  }
}
