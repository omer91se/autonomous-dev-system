# Port Configuration Guide

Complete guide for running the UI on custom ports when default ports are taken.

## Default Ports

By default, the system uses:
- **UI (Next.js)**: Port 3000
- **WebSocket Server**: Port 3001

## What If Ports Are Taken?

If port 3000 or 3001 is already in use, you can easily configure custom ports.

## Method 1: Environment Variables (Recommended)

### Step 1: Create .env.local File

In the `ui/` directory, create a `.env.local` file:

```bash
cd ui
cat > .env.local << EOF
NEXT_PUBLIC_UI_PORT=3002
NEXT_PUBLIC_WS_PORT=3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
EOF
```

### Step 2: Start the UI

```bash
npm run dev
```

The UI will automatically use ports 3002 and 3003!

### Step 3: Run Orchestrator with Custom Ports

```bash
cd ..
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 tsx orchestrate-ui.ts "Your app idea"
```

### Step 4: Open Browser

Visit **http://localhost:3002** (not 3000!)

## Method 2: Inline Environment Variables

Start everything with one command:

```bash
# In ui/ directory
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev

# In project root (another terminal)
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 tsx orchestrate-ui.ts "Your idea"
```

## Method 3: Using npm run Scripts

### Add to ui/package.json:

```json
{
  "scripts": {
    "dev:alt": "NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev"
  }
}
```

### Run:

```bash
npm run dev:alt
```

## How It Works

### 1. UI Port (Next.js)

Configured via `NEXT_PUBLIC_UI_PORT`:
- The Next.js dev server starts on this port
- Default: 3000
- Used in browser: `http://localhost:${NEXT_PUBLIC_UI_PORT}`

### 2. WebSocket Port

Configured via `NEXT_PUBLIC_WS_PORT`:
- WebSocket server listens on this port
- Default: 3001
- Used for real-time updates between orchestrator and UI

### 3. WebSocket URL

Configured via `NEXT_PUBLIC_WS_URL`:
- Frontend connects to this URL
- Default: `ws://localhost:3001`
- **Must match WebSocket port!**

## Detecting Current Ports

### Check What's Running

```bash
# Check if Next.js is running and on which port
lsof -i :3000  # Default
lsof -i :3002  # Alternative

# Check WebSocket server
lsof -i :3001  # Default
lsof -i :3003  # Alternative
```

### Find UI Port Automatically

```bash
# Check common ports
for port in 3000 3001 3002 3003 3004 3005; do
  if curl -s http://localhost:$port > /dev/null 2>&1; then
    echo "Found UI on port $port"
  fi
done
```

## Using /build-app with Custom Ports

The `/build-app` command automatically detects the UI on different ports!

### With UI on Port 3002:

1. **Start UI**:
   ```bash
   cd ui
   NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev
   ```

2. **Open Browser**: http://localhost:3002

3. **Run /build-app**:
   ```
   /build-app Your app idea
   ```

The command checks ports 3000-3005 automatically and detects your UI!

## Common Scenarios

### Scenario 1: Port 3000 Taken by Another App

**Solution**: Use port 3002 for UI, 3003 for WebSocket

```bash
# Start UI
cd ui
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev

# Use /build-app (auto-detects port 3002)
/build-app Your app idea

# Or manually
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 tsx orchestrate-ui.ts "Your idea"
```

### Scenario 2: Running Multiple UI Instances

Want to run multiple projects simultaneously?

**Project 1**:
```bash
# Terminal 1
cd project1/ui
NEXT_PUBLIC_UI_PORT=3000 NEXT_PUBLIC_WS_PORT=3001 npm run dev
```

**Project 2**:
```bash
# Terminal 2
cd project2/ui
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev
```

Each has its own UI and WebSocket server!

### Scenario 3: Production Deployment

For production, use standard ports:

```bash
# .env.production
NEXT_PUBLIC_UI_PORT=80
NEXT_PUBLIC_WS_PORT=8080
NEXT_PUBLIC_WS_URL=wss://your-domain.com:8080
```

## Troubleshooting

### UI Won't Start - Port in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
NEXT_PUBLIC_UI_PORT=3002 npm run dev
```

### WebSocket Connection Failed

**Error**: `WebSocket connection to 'ws://localhost:3001' failed`

**Check**:
1. Is WebSocket server running? (`lsof -i :3001`)
2. Does `NEXT_PUBLIC_WS_URL` match the actual WebSocket port?
3. Are you using custom ports? Update both:
   ```bash
   NEXT_PUBLIC_WS_PORT=3003
   NEXT_PUBLIC_WS_URL=ws://localhost:3003
   ```

### Orchestrator Can't Connect to UI

**Error**: UI shows "Disconnected"

**Solution**:
```bash
# Make sure both use same ports
export NEXT_PUBLIC_UI_PORT=3002
export NEXT_PUBLIC_WS_PORT=3003

# Start UI
cd ui
npm run dev

# Run orchestrator
cd ..
tsx orchestrate-ui.ts "Your idea"
```

### /build-app Not Detecting UI

**Problem**: Running on port 3010 but /build-app doesn't find it

**Solution**: The auto-detection only checks ports 3000-3005. Either:

1. Use a port in that range
2. Manually specify in the command
3. Update the detection range in `.claude/commands/build-app.md`

## Environment Variables Summary

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `NEXT_PUBLIC_UI_PORT` | Next.js server port | 3000 | 3002 |
| `NEXT_PUBLIC_WS_PORT` | WebSocket server port | 3001 | 3003 |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for frontend | ws://localhost:3001 | ws://localhost:3003 |

## Quick Reference

### Default Setup (Ports Free)
```bash
cd ui && npm run dev
# UI: http://localhost:3000
# WS: ws://localhost:3001
```

### Custom Ports (Port 3000 Taken)
```bash
cd ui
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev
# UI: http://localhost:3002
# WS: ws://localhost:3003
```

### Permanent Custom Ports
```bash
# Create ui/.env.local
echo "NEXT_PUBLIC_UI_PORT=3002" > ui/.env.local
echo "NEXT_PUBLIC_WS_PORT=3003" >> ui/.env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:3003" >> ui/.env.local

# Then just run normally
cd ui && npm run dev
```

## Need Help?

- Check what's using a port: `lsof -i :PORT`
- Kill a process on a port: `lsof -ti:PORT | xargs kill -9`
- Test if UI is accessible: `curl http://localhost:PORT`
- Check WebSocket: Look for "WebSocket server running on" in terminal output

---

**Remember**: Both the UI and the orchestrator must use the **same port configuration**!
