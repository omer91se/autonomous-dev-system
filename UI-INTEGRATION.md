# UI Integration with Agents

**All agents now automatically integrate with the UI dashboard!**

When any agent is spawned (through `/build-app`, `/improve-app`, `/market-app`, or manually), it automatically:

1. **Registers with UI** - Shows up in the Agent Activity panel
2. **Reports Progress** - Updates status in real-time
3. **Logs Events** - All important events appear in the UI
4. **Persists History** - Saves everything to `build-history/` for later viewing

## How It Works

Every agent prompt now includes UI integration instructions. When an agent starts:

1. **Agent registers itself** - Calls `notify-ui.ts start` to create a session
2. **Agent does its work** - User sees real-time status in UI
3. **Agent reports completion** - Calls `notify-ui.ts complete` when done
4. **Agent reports errors** - Calls `notify-ui.ts error` if something fails

## Setup

### 1. Start the UI Dashboard

```bash
cd ui
npm run dev
```

The UI will start on http://localhost:3000

### 2. Use Slash Commands Normally

Just use your slash commands as usual:

```
/build-app "build a todo app with user auth"
```

Claude Code will automatically:
- Notify the UI when each agent starts
- Update progress as agents work
- Mark agents as complete when done
- Show any errors if they occur

## What You'll See in the UI

**Agent Activity Panel:**
- Real-time agent status (running, completed, error)
- Current task description
- Progress indicators
- Start/completion timestamps
- Duration tracking

**Build Logs:**
- Phase transitions
- Agent lifecycle events
- Important milestones
- Error messages

**Build History:**
- All past builds
- Agents that ran for each build
- Complete log history
- Time tracking

## Under the Hood

Each agent prompt includes these instructions at the top:

**1. When agent starts:**
```bash
AGENT_ID=$(npx tsx scripts/notify-ui.ts start "Agent Name" "type" "Task description" | jq -r .agentId)
```

**2. When agent completes:**
```bash
npx tsx scripts/notify-ui.ts complete "$AGENT_ID" "Agent Name" "type" "Success message"
```

**3. If agent encounters errors:**
```bash
npx tsx scripts/notify-ui.ts error "$AGENT_ID" "Agent Name" "type" "Error message"
```

These commands:
1. Send WebSocket messages to the UI (if running)
2. Save to build history JSON files
3. Work even if UI is not running (graceful degradation)

**This happens automatically** - agents handle it themselves, no manual intervention needed!

## Build History

All builds are saved in `build-history/` as JSON files:

```
build-history/
├── build-1234567890.json    # Build session data
├── build-1234567891.json    # Another build
└── .current-build            # Tracks active build
```

You can view past builds by:

```bash
# List all builds
node scripts/build-history.js list

# View specific build
node scripts/build-history.js get build-1234567890

# Delete old build
node scripts/build-history.js delete build-1234567890
```

## CLI Commands

If you want to manually send UI updates:

```bash
# Start an agent
tsx scripts/notify-ui.ts start "Agent Name" "agent-type" "What it's doing"

# Complete an agent (need the agentId from start command output)
tsx scripts/notify-ui.ts complete "agent-id-123" "Agent Name" "agent-type" "Completed task"

# Log a message
tsx scripts/notify-ui.ts log "info" "Build started" "System"
```

## Troubleshooting

**UI not showing agents?**
1. Check UI is running: http://localhost:3000
2. Check WebSocket server is running (it auto-starts with UI)
3. Check console for WebSocket connection errors

**Agents not appearing even with UI running?**
- The WebSocket might be on a different port
- Set the port: `export WS_PORT=3001`
- Restart the UI

**Want to use a different port?**
```bash
# Start UI on different ports
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev

# Then set for CLI
export WS_PORT=3003
```

## Benefits

- **Real-time visualization** of your autonomous build
- **Track progress** without reading terminal logs
- **Beautiful UI** showing all agent activity
- **Build history** to review past builds
- **Works offline** - saves even if UI isn't running
- **Zero config** - automatic integration with slash commands
