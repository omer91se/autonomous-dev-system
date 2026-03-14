# Where to See Updates in the UI

Complete visual guide showing exactly where real-time updates appear in the dashboard.

## 🌐 Step 1: Open the Dashboard

**URL**: http://localhost:3000 (or your custom port like 3002)

When the UI is running, you'll see the dashboard in your browser.

## 📍 Where Updates Appear

### 1. Connection Status Indicator (Top Right)

**Location**: Header bar, right side

```
┌─────────────────────────────────────────────────────────┐
│  Autonomous Dev System        ● Connected               │
│                                 ↑                        │
│                            THIS SHOWS CONNECTION         │
└─────────────────────────────────────────────────────────┘
```

**What you'll see:**
- **Green dot + "Connected"** = Receiving live updates ✅
- **Red dot + "Disconnected"** = Not receiving updates ❌

**When it updates:** Immediately when you start/stop the orchestrator

---

### 2. Pipeline Visualization (Top Section)

**Location**: Large horizontal bar showing 5 phases

```
┌────────────────────────────────────────────────────────────────┐
│            Build Pipeline                                      │
│                                                                │
│  [✓ Requirements] → [○ Design] → [⚙️  Development] → [Testing] │
│       Blue              Purple       Green         Orange      │
│                                  ↑                             │
│                           ACTIVE PHASE GLOWS & PULSES          │
└────────────────────────────────────────────────────────────────┘
```

**What you'll see:**
- **Completed phases**: Green with ✓ checkmark
- **Current phase**: Colored circle that pulses/glows
- **Pending phases**: Grey/dimmed circle

**When it updates:**
- When orchestrator starts a new phase
- When a phase completes
- Real-time as phases change

**What to watch for:**
- Blue glow = Requirements phase active
- Purple glow = Design phase active
- Green glow = Development phase active

---

### 3. Agent Activity Cards (Left Panel)

**Location**: Left side, below pipeline

```
┌─────────────────────────────────┐
│ 🤖 Agent Activity               │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ 🤖 Requirements Agent     │   │
│ │ Status: ● Running (2m 34s)│   │  ← UPDATES HERE
│ │ Current: Analyzing tech   │   │  ← AND HERE
│ │ Progress: ████████░░ 65%  │   │  ← AND HERE
│ └───────────────────────────┘   │
│                                 │
│ ┌───────────────────────────┐   │
│ │ 🤖 Coding Agent           │   │
│ │ Status: ⏸️  Idle           │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

**What you'll see:**
- **Agent cards appear** when agent starts
- **Status changes**: Idle → Running → Completed
- **Progress bar fills** from 0% to 100%
- **Current task text** updates in real-time
- **Timer counts up** while running

**When it updates:**
- When agent starts (card appears)
- Every few seconds (progress updates)
- When task changes
- When agent completes

**What to watch for:**
- Card appears = Agent spawned
- Progress bar moving = Agent working
- Green checkmark = Agent done

---

### 4. Activity Log (Left Panel, Below Agents)

**Location**: Left side, bottom section

```
┌─────────────────────────────────────────┐
│ 📝 Activity Log                         │
├─────────────────────────────────────────┤
│ [12:34:56] 🤖 Requirements Agent start  │ ← NEW
│ [12:35:12] 📝 Analyzing user input...   │ ← LOGS
│ [12:35:45] ✅ Generated requirements    │ ← APPEAR
│ [12:36:01] 🔔 Checkpoint: Awaiting...   │ ← HERE
│ [12:36:15] ✅ User approved checkpoint  │
│ [12:36:20] 🤖 Coding Agent started      │
│                     ↓                   │
│              AUTO-SCROLLS DOWN           │
└─────────────────────────────────────────┘
```

**What you'll see:**
- **Logs appear** line by line
- **Color-coded** by level:
  - Blue (🔵) = Info
  - Green (✅) = Success
  - Yellow (⚠️) = Warning
  - Red (❌) = Error
- **Timestamps** for each entry
- **Agent name** in brackets
- **Auto-scrolls** to show latest

**When it updates:**
- Constantly! Every action creates a log
- When orchestrator does something
- When agent reports progress
- When checkpoints are reached

**What to watch for:**
- Stream of messages = System working
- No new messages = Waiting or stuck
- Green checkmarks = Tasks completing
- Red errors = Something went wrong

---

### 5. File Tree Viewer (Right Panel)

**Location**: Right side, "File Tree" tab

```
┌─────────────────────────────────────────┐
│ [File Tree] [Requirements] [Code]       │
├─────────────────────────────────────────┤
│ 📁 output/generated-project/            │
│   ├─ 📁 app/                            │
│   │  ├─ 📄 page.tsx ✨ (just created)   │ ← NEW FILES
│   │  └─ 📁 api/                         │
│   ├─ 📁 components/                     │
│   │  └─ 📄 TodoItem.tsx ⏳ (writing)    │ ← LIVE STATUS
│   └─ 📄 package.json ✅                 │
└─────────────────────────────────────────┘
```

**What you'll see:**
- **Files appear** as they're created
- **Status badges**:
  - ✨ Just created (sparkle)
  - ⏳ Currently writing (hourglass)
  - ✅ Completed (checkmark)
- **Folders expand/collapse**
- **Click file** to preview code

**When it updates:**
- During development phase
- As coding agent creates files
- In real-time as files are generated

**What to watch for:**
- Tree populating = Code being written
- Sparkles (✨) = Fresh new files
- Many files = App taking shape

---

### 6. Checkpoint Modals (Overlay)

**Location**: Center of screen (pops over everything)

```
╔═══════════════════════════════════════╗
║     🔔 Requirements Review            ║
╠═══════════════════════════════════════╣
║                                       ║
║  📋 Generated Specifications          ║
║  ┌─────────────────────────────────┐ ║
║  │ Project: QuickTask              │ ║ ← PREVIEW
║  │ Stack: Next.js + PostgreSQL     │ ║   UPDATES
║  │ Features: Auth, Todo CRUD       │ ║   HERE
║  └─────────────────────────────────┘ ║
║                                       ║
║  💭 Add feedback (optional)           ║
║  ┌─────────────────────────────────┐ ║
║  │                                 │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║   [✅ Approve & Continue] [❌ Reject] ║ ← CLICK HERE
╚═══════════════════════════════════════╝
```

**What you'll see:**
- Modal **slides in from top**
- Shows generated artifact preview
- Input box for feedback
- Two buttons: Approve or Reject

**When it appears:**
- After requirements phase completes
- After development phase completes
- Whenever orchestrator hits a checkpoint

**What to do:**
1. Read the preview
2. Add feedback if you want changes
3. Click "Approve & Continue" to proceed
4. Or click "Reject" to stop and revise

**Action required**: You MUST click a button for the build to continue!

---

### 7. Code Preview (Right Panel)

**Location**: Right side, "Code Preview" tab

```
┌─────────────────────────────────────────┐
│ [File Tree] [Requirements] [Code]       │
├─────────────────────────────────────────┤
│  1  export default function Page() {    │
│  2    return (                          │ ← CODE
│  3      <div className="container">     │   APPEARS
│  4        <h1>Todo List</h1>            │   HERE
│  5      </div>                          │
│  6    )                                 │
│  7  }                                   │
│                                         │
│         (Syntax highlighted)            │
└─────────────────────────────────────────┘
```

**What you'll see:**
- Full Monaco editor
- Syntax highlighting
- Line numbers
- Read-only view

**When it updates:**
- When you click a file in the tree
- File content loads and displays

**What to do:**
- Click files in the tree to preview them
- Scroll through code
- See what the agent generated

---

## 🎬 Timeline of Updates (What to Expect)

Here's what you'll see in order when you run `/build-app`:

### T+0s: Start
```
● Connection Status: Changes to "Connected" (green)
📝 Activity Log: "Orchestrator connected to UI"
```

### T+2s: Requirements Phase Begins
```
📊 Pipeline: Requirements phase turns BLUE and pulses
🤖 Agent Card: "Requirements Agent" appears with status "Running"
📝 Activity Log: "Requirements Agent started"
📝 Activity Log: "Analyzing user input..."
🤖 Progress Bar: Starts filling 0% → 10% → 20%...
```

### T+30s-2m: Requirements In Progress
```
📝 Activity Log: Continuous updates
   - "Analyzing tech stack..."
   - "Determining database needs..."
   - "Planning features..."
🤖 Progress Bar: 30% → 50% → 70% → 90%
🤖 Current Task: Text updates showing what's happening
```

### T+2m: Requirements Complete
```
📝 Activity Log: "✅ Generated requirements.json"
🤖 Agent Status: Changes to "Completed"
🤖 Progress Bar: 100% (green)
📊 Pipeline: Requirements gets ✓ checkmark
🔔 MODAL POPS UP: Requirements Review checkpoint
```

**⏸️  WAITING FOR YOU** - Click Approve/Reject in the modal!

### After Approval: Development Phase
```
📊 Pipeline: Development phase turns GREEN and pulses
🤖 Agent Card: "Coding Agent" appears
📝 Activity Log: "Coding Agent started"
📁 File Tree: Starts populating with files
   - app/ folder appears
   - components/ folder appears
   - Files appear with ✨ badges
🤖 Progress Bar: 0% → 100% over ~5-10 minutes
```

### Development Complete
```
📝 Activity Log: "✅ Implementation complete"
📊 Pipeline: Development gets ✓ checkmark
🔔 MODAL POPS UP: Implementation Review checkpoint
```

### After Final Approval
```
📝 Activity Log: "✅ Project completed successfully!"
📊 Pipeline: All phases complete
🤖 All agents show "Completed"
```

---

## 🔍 What If I Don't See Updates?

### Check #1: Connection Status
**Look at**: Top right corner
**Should say**: "● Connected" (green)
**If it says "Disconnected"**:
- WebSocket server not running
- Refresh the browser page
- Restart UI: `cd ui && npm run dev`

### Check #2: Activity Log
**Look at**: Left panel, bottom
**Should see**: New lines appearing
**If empty or frozen**:
- Orchestrator may not be running
- Check terminal where you ran orchestrator
- Look for errors in terminal

### Check #3: Browser Console
**Open**: Press F12 in Chrome
**Look for**:
- WebSocket connection errors
- "Connected to orchestrator" message
- Any red errors

### Check #4: Correct URL
**Make sure you're at**:
- http://localhost:3000 (default)
- Or your custom port (like http://localhost:3002)
**Not**:
- http://localhost:3001 (that's WebSocket port)
- https:// (use http://)

---

## 📱 Quick Visual Checklist

When everything is working, you should see:

```
✅ Green "Connected" indicator (top right)
✅ Pipeline showing current phase glowing
✅ Agent card(s) with "Running" status
✅ Progress bars moving
✅ Logs streaming in real-time
✅ Files appearing in tree (during dev phase)
✅ Modal appears when checkpoint reached
```

If you're missing any of these, something's not connected properly!

---

## 💡 Pro Tip: Side-by-Side View

**Recommended setup:**
1. **Left monitor/window**: Terminal with orchestrator running
2. **Right monitor/window**: Chrome with http://localhost:3000

Watch both simultaneously to see:
- Terminal: What orchestrator is doing
- Browser: Visual representation of the same actions

It's like watching the same movie with director's commentary! 🎬

---

## Need Help?

- Not seeing updates? Check [UI_QUICKSTART.md](UI_QUICKSTART.md) troubleshooting
- Port issues? See [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md)
- General issues? See [README.md](README.md) usage section

**Remember**: Updates happen in REAL-TIME. If you don't see movement within 5-10 seconds of starting the orchestrator, something's not connected!
