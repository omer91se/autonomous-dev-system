# Workflow Visualization - Real-Time Agent Pipeline

## ✨ What You Get

The UI now shows a **live workflow visualization** that displays:

### 🌳 Tree/Flowchart View
- Agents organized in stages (Start → Stage 1 → Stage 2 → etc.)
- Visual dependencies showing which agents need which outputs
- Arrow connections between stages

### 📊 Real-Time Status
- **Pending** (gray) - Agent hasn't started yet
- **Running** (blue, animated) - Agent is currently working
- **Completed** (green) - Agent finished successfully
- **Error** (red) - Agent encountered an error

### 🔄 Data Flow Visualization
Each agent card shows:
- **Inputs** - What files/data it needs (e.g., `business-plan.json`)
- **Outputs** - What it produces (e.g., `product-spec.json`, `design-system.json`)
- **Dependencies** - Which agents must complete first
- **Progress** - Live progress bar for running agents

### 🎯 Current Focus
- Running agents are highlighted with animated icons
- Progress bars show real-time completion percentage
- The workflow automatically updates as agents start and complete

## 🎬 Live Demo (What You Just Saw)

I just ran a live demo showing:

1. **Marketing Strategist** started → completed
2. **Content Creator** and **SEO Specialist** started in parallel (both depend on Marketing Strategist)
3. All agents completed successfully
4. The UI updated in real-time without refresh!

## 📋 Supported Workflows

### Build Workflow (7 agents)
```
CEO Agent
  └─> PM Agent
       ├─> Designer Agent ──┐
       └─> Architect Agent ─┤
            ├─> Backend Developer ─┐
            └─> Frontend Developer ─┤
                 └─> QA Agent
```

**Outputs Flow:**
- CEO → `business-plan.json`
- PM → `product-spec.json`
- Designer → `design-system.json`, `mockups/`
- Architect → `architecture.json`, `api-contracts.yaml`
- Backend → Backend Code
- Frontend → Frontend Code
- QA → `test-results.json`, `qa-report.md`

### Improve Workflow (6 agents)
```
Analysis Agent
  └─> PM Agent
       ├─> Designer Agent ─> Frontend Developer
       └─> Architect Agent ─> Backend Developer
```

**Outputs Flow:**
- Analysis → `analysis-report.json`
- PM → `improvement-spec.json`
- Designer → `design-improvements.json`
- Architect → `architecture-improvements.json`
- Backend → Updated Backend Code
- Frontend → Updated Frontend Code

### Market Workflow (5 agents)
```
Marketing Strategist
  ├─> Content Creator
  ├─> SEO Specialist
  ├─> Social Media Manager
  └─> Email Marketing Agent
```

**Outputs Flow:**
- Marketing Strategist → `marketing-strategy.json`
- Content Creator → `marketing-content/`
- SEO → `seo-strategy.json`
- Social → `social-media-plan.json`
- Email → `email-campaigns/`

## 🚀 How to Use

### Automatic Workflow Detection

The UI automatically detects which workflow is running based on agent types:

- **Marketing agents** detected → Shows Market workflow
- **Analysis agent** detected → Shows Improve workflow
- **Default** → Shows Build workflow

### Real-Time Updates

**Everything updates automatically!** When you use slash commands like `/build-app`, `/improve-app`, or `/market-app`:

1. I (Claude Code) call `notify-ui.ts` before spawning each agent
2. Agent appears in the UI immediately
3. As the agent works, status updates
4. When complete, agent turns green
5. Next dependent agents can start

### Manual Testing

You can manually test the visualization:

```bash
# Start an agent
AGENT_ID=$(npx tsx scripts/notify-ui.ts start "CEO Agent" "ceo" "Analyzing business viability")

# Watch it appear in UI!

# Complete the agent
npx tsx scripts/notify-ui.ts complete "$AGENT_ID" "CEO Agent" "ceo" "Business plan created"

# Watch it turn green!
```

## 📍 Where to Find It

1. Open UI: http://localhost:3000
2. Click **"Build Tracking"** tab
3. You'll see:
   - **Workflow Pipeline** (new!) - Tree visualization at top
   - **Agent Activity** - Detailed agent cards
   - **Build Logs** - Event stream

## 🎨 Features

### Visual Indicators
- **Stage badges** - "Start", "Stage 1", "Stage 2"
- **Status icons** - Clock (pending), Spinner (running), Checkmark (done), X (error)
- **Animated** - Running agents rotate, progress bars fill
- **Color-coded** - Gray/Blue/Green/Red for status

### Information Display
- Agent name and type
- Current task description
- Input files needed
- Output files created
- Progress percentage
- Dependencies on other agents

### Smart Layout
- Agents grouped by stage/layer
- Parallel agents shown side-by-side
- Sequential agents shown vertically
- Arrows show data flow

## 🔧 Technical Details

### How It Works

1. **WebSocket Connection** - UI connects to port 3001
2. **Agent Registration** - `notify-ui.ts` sends agent data via WebSocket
3. **State Management** - React updates agent array
4. **Auto-detection** - Workflow type detected from agent types
5. **Re-render** - Component re-renders with new data
6. **Animation** - Framer Motion animates changes

### Data Structure

Each agent sends:
```typescript
{
  id: "agent-ceo-123",
  name: "CEO Agent",
  type: "ceo",
  status: "running",
  currentTask: "Analyzing business viability",
  progress: 45,
  startedAt: "2026-03-14T15:30:00Z",
  completedAt: "2026-03-14T15:35:00Z" // when done
}
```

The workflow visualization maps this to:
```typescript
{
  id: "ceo",
  name: "CEO Agent",
  type: "ceo",
  inputs: ["User Idea"],
  outputs: ["business-plan.json"],
  dependencies: [],
  status: "running" // from agent data
}
```

## 💡 Pro Tips

1. **Keep UI open** while running slash commands to see live progress
2. **Track multiple workflows** - Each build gets its own visualization
3. **Review history** - Select past builds from dropdown to see their workflow
4. **Spot bottlenecks** - See which agents take longest
5. **Debug failures** - Red agents show exactly where things failed

## 🎯 What's Next

Upcoming enhancements:
- Time estimates for each stage
- Agent output previews on hover
- Expandable agent cards with detailed logs
- Workflow replay animation
- Custom workflow definitions
- Agent communication visualization

## 🐛 Troubleshooting

**Workflow not showing?**
- Check if UI is running on port 3000
- Check if WebSocket server is running on port 3001
- Verify agents are being registered with notify-ui.ts

**Agents not updating?**
- Check browser console for WebSocket errors
- Verify notify-ui.ts is being called before/after agent spawn
- Check build-history/ directory for saved data

**Wrong workflow displayed?**
- Workflow type is auto-detected from agent types
- Marketing agents → Market workflow
- Analysis agent → Improve workflow
- Default → Build workflow

## ✅ Summary

You now have a **beautiful, real-time workflow visualization** that shows:
- 🌳 Tree/flowchart of all agents
- 📊 Live status updates
- 🔄 Data flow between agents
- ⚡ Progress tracking
- 🎯 Current focus highlighting

**No refresh needed - it all updates live via WebSocket!** 🚀
