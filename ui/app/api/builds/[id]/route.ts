import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const BUILD_HISTORY_SCRIPT = path.join(process.cwd(), '..', 'scripts', 'build-history.js');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Call build-history.js to get specific build
    const { stdout } = await execAsync(`node "${BUILD_HISTORY_SCRIPT}" get ${id}`);
    const build = JSON.parse(stdout);

    if (!build) {
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(build);
  } catch (error: any) {
    console.error('Build API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch build', details: error.message },
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

    // Call build-history.js to delete build
    await execAsync(`node "${BUILD_HISTORY_SCRIPT}" delete ${id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Build delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete build', details: error.message },
      { status: 500 }
    );
  }
}
