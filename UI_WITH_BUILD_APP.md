# Using `/build-app` with the Visual UI

Complete guide to getting the best experience: autonomous building with real-time visual feedback!

## 🎯 Quick Answer

**YES!** When you use `/build-app`, it **automatically detects and uses the UI** if it's running.

## 🚀 Recommended Workflow

### Step 1: Start the UI Dashboard

Open a terminal and run:

```bash
cd ui
npm install  # First time only
npm run dev
```

You should see:
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
○ Network: http://192.168.1.x:3000
```

### Step 2: Open the Dashboard

Open your browser to **http://localhost:3000**

You'll see the beautiful landing page with:
- App idea input field
- Example ideas
- Connection status indicator (should show "Connected")

### Step 3: Use `/build-app` in Claude Code

In your Claude Code session, just type:

```
/build-app A todo list app with task priorities and due dates
```

### Step 4: Watch the Magic! ✨

The `/build-app` command will:
1. **Detect** that the UI is running at http://localhost:3000
2. **Automatically use** `orchestrate-ui.ts` instead of manual agent spawning
3. **Send real-time updates** to your browser via WebSocket

In your browser, you'll see:
- 📊 **Pipeline lighting up** - Watch phases turn from grey → blue → green
- 🤖 **Agent cards appearing** - "Requirements Agent" starts working
- 📝 **Logs streaming** - Every action in real-time
- ⏳ **Progress bars filling** - See exactly how far along agents are

### Step 5: Review Checkpoints in Browser

When the requirements are ready:
- 🔔 A beautiful **modal pops up** in your browser
- You see the generated requirements
- Click **"Approve & Continue"** or **"Reject"**
- The orchestrator in terminal receives your decision automatically

### Step 6: Watch Development Phase

After approving requirements:
- Development phase activates (turns green)
- Coding Agent starts working
- File tree populates in real-time as files are created
- Click any file to preview it with syntax highlighting
- Watch logs stream as the agent explains what it's doing

### Step 7: Final Checkpoint

When development completes:
- Another modal appears with implementation summary
- Review and approve
- Project completes!

## 📊 Visual Elements You'll See

### Pipeline Visualization
```
[✓ Requirements] → [○ Design] → [⚙️  Development] → [○ Testing] → [○ Deployment]
     Blue              Purple         Green            Orange         Red
```

- **Completed**: Green checkmark ✓
- **Active**: Colored circle with pulse animation
- **Pending**: Grey circle ○

### Agent Activity Cards
```
┌─────────────────────────────────┐
│ 🤖 Requirements Agent           │
│ Status: ● Running (2m 34s)      │
│ Current: Analyzing tech stack   │
│ Progress: ████████░░░░ 65%      │
└─────────────────────────────────┘
```

### Live Logs
```
[12:34:56] 🤖 Requirements Agent started
[12:35:12] 📝 Analyzing user input...
[12:35:45] ✅ Generated requirements.json
[12:36:01] 🔔 Checkpoint: Awaiting approval
```

### File Tree (appears during development)
```
📁 output/generated-project/
  ├─ 📁 app/
  │  ├─ 📄 page.tsx ✨ (just created)
  │  └─ 📁 api/
  ├─ 📁 components/
  └─ 📄 package.json ✅
```

## 💡 Pro Tips

### Dual Monitor Setup
- **Left screen**: Browser with UI at http://localhost:3000
- **Right screen**: Claude Code terminal
- Watch both in real-time!

### What If UI Isn't Running?

If you run `/build-app` without the UI running:
- ✅ It still works! Falls back to CLI-only mode
- You'll get text-based checkpoints in the terminal
- System will suggest: "Want visuals? Run `cd ui && npm run dev`"

### Troubleshooting

**UI shows "Disconnected"?**
- WebSocket server might not be running
- The `npm run dev` in `ui/` starts both Next.js AND WebSocket
- Check terminal for errors

**Nothing happens in browser?**
- Make sure you actually ran `/build-app` in Claude Code
- Check browser console (F12) for errors
- Refresh the page (UI auto-reconnects)

**Port conflicts?**
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Restart UI
cd ui && npm run dev
```

## 🎬 Example Session

**Terminal 1 (UI):**
```bash
cd ui
npm run dev

# Output:
# ✓ Ready in 2.3s
# ○ Local: http://localhost:3000
# 🚀 WebSocket server running on ws://localhost:3001
```

**Browser:**
- Open http://localhost:3000
- See "Connected" indicator

**Terminal 2 (Claude Code):**
```
You: /build-app An expense tracker with categories and charts

Claude Code:
╔════════════════════════════════════════════════════════════════════════════╗
║                        AUTONOMOUS APP BUILDER                              ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 App Idea: An expense tracker with categories and charts

✅ UI detected at http://localhost:3000
🎨 Using visual dashboard mode!

👀 WATCH AT: http://localhost:3000

⏳ Running orchestrator with UI integration...
```

**Browser (simultaneously):**
- Pipeline lights up: Requirements phase goes blue
- Agent card appears: "Requirements Agent - Running"
- Logs start streaming
- Progress bar fills
- Checkpoint modal pops up
- You click "Approve"
- Development phase lights up
- Files appear in tree
- Final checkpoint
- Success! 🎉

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Terminal: /build-app "idea"                                │
│       ↓                                                      │
│  Checks: Is http://localhost:3000 responding?               │
│       ↓                                                      │
│  YES → Uses orchestrate-ui.ts → Sends WebSocket messages    │
│       ↓                                                      │
│  Browser receives updates in real-time                      │
│       ↓                                                      │
│  User sees beautiful UI and approves in browser             │
│       ↓                                                      │
│  Terminal receives approval → Continues                     │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Question:** Will I see agents work in the UI when using `/build-app`?

**Answer:** YES! Just make sure:
1. ✅ UI is running (`cd ui && npm run dev`)
2. ✅ Browser open to http://localhost:3000
3. ✅ Run `/build-app "your idea"` in Claude Code
4. ✅ Watch the beautiful real-time visualization!

The `/build-app` command is **smart** - it detects the UI and uses it automatically. No extra configuration needed!

---

**Need help?** See [UI_QUICKSTART.md](UI_QUICKSTART.md) for UI setup
