import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), '..', 'output');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Determine full path based on file location
    let fullPath: string;

    if (path.includes('requirements.json') || path.includes('implementation.json')) {
      fullPath = join(OUTPUT_DIR, path);
    } else {
      fullPath = join(OUTPUT_DIR, 'generated-project', path);
    }

    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const content = readFileSync(fullPath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('File content API error:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
