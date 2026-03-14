# UI Quick Start Guide

Get the visual dashboard running in 3 simple steps!

## Step 1: Install UI Dependencies

```bash
cd ui
npm install
```

## Step 2: Start the Dashboard

```bash
npm run dev
```

This starts:
- **Next.js dev server** on http://localhost:3000
- **WebSocket server** on ws://localhost:3001

## Step 3: Run Your First Project

Open a new terminal and run:

```bash
cd ..  # Back to project root
tsx orchestrate-ui.ts "A todo list app with priorities"
```

Now watch the dashboard at http://localhost:3000 to see:

✨ **Real-time updates** as the orchestrator runs
🤖 **Agent activity** with live progress bars
📝 **Streaming logs** of every action
📊 **Pipeline visualization** showing current phase
✅ **Checkpoint modals** for reviewing and approving work

## What You'll See

### 1. Dashboard Landing Page
When you first visit http://localhost:3000, you'll see a beautiful welcome screen with:
- Input field to describe your app idea
- Example ideas to get started
- Feature highlights

### 2. Active Project View
Once the orchestrator starts, the view switches to show:

**Top**: Pipeline with 5 phases (Requirements → Design → Development → Testing → Deployment)
- Active phase glows and pulses
- Completed phases show checkmarks
- Pending phases are dimmed

**Left Panel**:
- **Agent Activity Cards**: Live status of each agent with progress bars
- **Activity Log**: Terminal-style streaming logs with timestamps

**Right Panel**:
- **File Tree**: Real-time view of generated files
- **Requirements Tab**: View generated requirements.json
- **Code Preview**: Monaco editor for viewing code

### 3. Checkpoint Modal
When the orchestrator reaches a checkpoint:
- Beautiful modal slides in from top
- Shows preview of generated artifact
- Text area for optional feedback
- Approve/Reject buttons

Your decision is sent to the orchestrator automatically!

## Tips

- **Keep both terminals visible** to see the coordination between CLI and UI
- **The WebSocket connection** must be active for real-time updates
- **Refresh the browser** if you lose connection (reconnects automatically)
- **Check the browser console** for debug information if needed

## Troubleshooting

**Port already in use?**

Option 1: Use different ports (recommended)
```bash
cd ui
NEXT_PUBLIC_UI_PORT=3002 NEXT_PUBLIC_WS_PORT=3003 npm run dev
```

Option 2: Kill the process using the port
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Need custom ports?** See [PORT_CONFIGURATION.md](../PORT_CONFIGURATION.md) for complete guide.

**Connection failed?**
- Ensure both dev servers are running (`npm run dev` in ui/)
- Check firewall settings
- Try refreshing the browser

**Build errors?**
```bash
cd ui
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

1. **Customize the UI**: Edit `tailwind.config.ts` for colors
2. **Add features**: Modify components in `ui/components/`
3. **Enhance orchestrator**: Update `orchestrate-ui.ts` to send more events
4. **Deploy**: Run `npm run build` and deploy to Vercel

Enjoy your visual autonomous development experience! 🚀
