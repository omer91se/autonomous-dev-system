# Autonomous Dev System - UI

A beautiful, real-time dashboard for monitoring and controlling the autonomous development system.

## Features

✨ **Real-time Pipeline Visualization**
- Live phase progress with animated transitions
- Visual status indicators for each development stage
- Interactive phase navigation

🤖 **Agent Activity Monitoring**
- Live agent status cards with progress bars
- Real-time task updates
- Error reporting and handling

📊 **Live Log Stream**
- Terminal-style activity logs
- Color-coded log levels (info, success, warning, error)
- Auto-scrolling with syntax highlighting

📁 **File Tree Viewer**
- Real-time file creation notifications
- Expandable directory tree
- Live code preview with Monaco Editor

✅ **Checkpoint Review Interface**
- Beautiful modal for reviewing generated artifacts
- Approve/reject workflow with feedback
- Full content preview

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Run the development server (both Next.js and WebSocket)
npm run dev
```

The UI will be available at:
- **Dashboard**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Next.js Frontend                   │
│  (Dashboard, Components, Real-time Updates)     │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTP API + WebSocket
                  │
┌─────────────────┴───────────────────────────────┐
│           Backend Services                      │
│  ├─ Next.js API Routes (/api/*)                │
│  └─ WebSocket Server (port 3001)               │
└─────────────────┬───────────────────────────────┘
                  │
                  │ File System Watchers
                  │
┌─────────────────┴───────────────────────────────┐
│         Orchestrator Output                     │
│  ../output/                                     │
│    ├─ project-state.json                       │
│    ├─ requirements.json                        │
│    ├─ implementation.json                      │
│    └─ generated-project/                       │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Monaco Editor** - Code preview
- **Lucide Icons** - Beautiful icons
- **WebSocket** - Real-time updates
- **date-fns** - Date formatting

## Project Structure

```
ui/
├── app/
│   ├── api/                    # API routes
│   │   ├── checkpoint/         # Checkpoint decisions
│   │   ├── files/             # File tree endpoint
│   │   └── file-content/      # File content endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── Dashboard.tsx          # Welcome screen
│   ├── PipelineVisualization.tsx
│   ├── AgentActivityPanel.tsx
│   ├── LogStream.tsx
│   ├── OutputPreview.tsx
│   ├── FileTreeViewer.tsx
│   ├── CodeViewer.tsx
│   └── CheckpointModal.tsx
├── server/
│   └── websocket.ts           # WebSocket server
├── types/
│   └── index.ts               # TypeScript types
└── lib/                       # Utilities (if needed)
```

## Development

```bash
# Run Next.js dev server only
npm run dev:next

# Run WebSocket server only
npm run dev:ws

# Run both (recommended)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## WebSocket Events

The WebSocket server broadcasts the following events:

### `state_update`
Sent when `project-state.json` changes
```json
{
  "type": "state_update",
  "data": {
    "projectId": "proj-123",
    "phase": "development",
    ...
  }
}
```

### `agent_update`
Sent when agent status changes
```json
{
  "type": "agent_update",
  "data": {
    "id": "agent-123",
    "name": "Coding Agent",
    "status": "running",
    "progress": 65,
    ...
  }
}
```

### `log`
Sent for activity logs
```json
{
  "type": "log",
  "data": {
    "level": "info",
    "message": "Starting requirements analysis...",
    "agent": "Requirements Agent",
    "timestamp": "2024-03-14T12:00:00Z"
  }
}
```

### `checkpoint`
Sent when a checkpoint is reached
```json
{
  "type": "checkpoint",
  "data": {
    "id": "checkpoint-123",
    "type": "Requirements Review",
    "status": "pending",
    "artifactPath": "requirements.json",
    ...
  }
}
```

### `file_created`
Sent when files are created/modified
```json
{
  "type": "file_created",
  "data": {
    "path": "generated-project/app/page.tsx",
    "timestamp": "2024-03-14T12:00:00Z"
  }
}
```

## API Routes

### `POST /api/checkpoint`
Submit checkpoint decision (approve/reject)

**Request:**
```json
{
  "checkpointId": "checkpoint-123",
  "approved": true,
  "feedback": "Looks good!"
}
```

### `GET /api/files/:projectId`
Get file tree for a project

**Response:**
```json
{
  "files": [
    {
      "name": "app",
      "path": "app",
      "type": "directory",
      "children": [...]
    }
  ]
}
```

### `GET /api/file-content?path=...`
Get content of a specific file

**Response:**
```json
{
  "content": "// File content here..."
}
```

## Integration with Orchestrator

The UI automatically connects to the orchestrator by:

1. Watching the `../output` directory for changes
2. Reading `project-state.json` for current state
3. Broadcasting updates to all connected WebSocket clients
4. Displaying real-time progress in the dashboard

To integrate with your orchestrator:
1. Ensure it writes to `../output/project-state.json`
2. Update checkpoint status in the state file
3. Create files in `../output/generated-project/`
4. The UI will automatically reflect all changes

## Customization

### Colors
Edit `tailwind.config.ts` to customize phase colors:
```typescript
phase: {
  requirements: "#3b82f6",  // blue
  design: "#a855f7",        // purple
  development: "#10b981",   // green
  testing: "#f97316",       // orange
  deployment: "#ef4444",    // red
}
```

### Animations
Edit `app/globals.css` to add custom animations:
```css
@keyframes yourAnimation {
  /* keyframes */
}
```

## Troubleshooting

**WebSocket not connecting?**
- Ensure port 3001 is not in use
- Check that the WebSocket server is running (`npm run dev:ws`)
- Verify firewall settings

**Files not showing?**
- Ensure `../output/generated-project/` directory exists
- Check file permissions
- Verify API routes are working (check browser console)

**Build errors?**
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## License

MIT
