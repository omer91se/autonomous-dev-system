import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const CURRENT_BUILD_FILE = path.join(process.cwd(), '..', 'build-history', '.current-build');
const BUILD_HISTORY_DIR = path.join(process.cwd(), '..', 'build-history');

export async function GET() {
  try {
    // Check if there's a current build
    if (!fs.existsSync(CURRENT_BUILD_FILE)) {
      return NextResponse.json({ build: null });
    }

    const buildId = fs.readFileSync(CURRENT_BUILD_FILE, 'utf-8').trim();
    const buildFile = path.join(BUILD_HISTORY_DIR, `${buildId}.json`);

    if (!fs.existsSync(buildFile)) {
      return NextResponse.json({ build: null });
    }

    const buildData = JSON.parse(fs.readFileSync(buildFile, 'utf-8'));

    return NextResponse.json({
      build: {
        id: buildId,
        ...buildData
      }
    });
  } catch (error) {
    console.error('Error loading current build:', error);
    return NextResponse.json({ build: null });
  }
}
