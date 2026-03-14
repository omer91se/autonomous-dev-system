import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { FileNode } from '@/types';

const OUTPUT_DIR = join(process.cwd(), '..', 'output');

function buildFileTree(dirPath: string, relativePath: string = ''): FileNode[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  const items = readdirSync(dirPath);
  const nodes: FileNode[] = [];

  for (const item of items) {
    // Skip hidden files and node_modules
    if (item.startsWith('.') || item === 'node_modules') continue;

    const fullPath = join(dirPath, item);
    const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      nodes.push({
        name: item,
        path: itemRelativePath,
        type: 'directory',
        children: buildFileTree(fullPath, itemRelativePath),
      });
    } else {
      nodes.push({
        name: item,
        path: itemRelativePath,
        type: 'file',
      });
    }
  }

  return nodes.sort((a, b) => {
    // Directories first, then alphabetically
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const projectDir = join(OUTPUT_DIR, 'generated-project');

    const files = buildFileTree(projectDir);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Files API error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
