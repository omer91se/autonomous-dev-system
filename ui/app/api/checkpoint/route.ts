import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), '..', 'output');
const STATE_FILE = join(OUTPUT_DIR, 'project-state.json');
const CHECKPOINT_FILE = join(OUTPUT_DIR, 'checkpoint-decision.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkpointId, approved, feedback } = body;

    // Save checkpoint decision
    const decision = {
      checkpointId,
      approved,
      feedback,
      timestamp: new Date().toISOString(),
    };

    writeFileSync(CHECKPOINT_FILE, JSON.stringify(decision, null, 2));

    // Update project state if exists
    if (existsSync(STATE_FILE)) {
      const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
      const checkpoint = state.checkpoints.find((c: any) => c.id === checkpointId);

      if (checkpoint) {
        checkpoint.status = approved ? 'approved' : 'rejected';
        writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkpoint API error:', error);
    return NextResponse.json({ error: 'Failed to process checkpoint' }, { status: 500 });
  }
}
