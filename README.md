# Autonomous Dev System - Claude Code Edition

An autonomous web/mobile app development system powered entirely by Claude Code agents. No API keys needed!

## 🎨 NEW: Visual Dashboard

The system now includes a beautiful real-time dashboard for monitoring and controlling the development process!

![Dashboard Features](ui/screenshot.png)

**Features:**
- 📊 Real-time pipeline visualization with animated progress
- 🤖 Live agent activity monitoring
- 📝 Streaming logs with syntax highlighting
- 📁 Interactive file tree with code preview
- ✅ Beautiful checkpoint review interface
- 🎨 Modern UI with smooth animations

[See UI Documentation →](ui/README.md)

## Architecture

This system uses **Claude Code** as the execution environment:
- You describe your app idea
- The orchestrator coordinates specialized Claude Code agents
- Each agent has access to all Claude Code tools (Read, Write, Edit, Bash, etc.)
- Agents spawn via the Task tool and work autonomously
- Human checkpoints for approval at major milestones

### How It Works

```
User provides app idea
    ↓
[Orchestrator Script] (orchestrate.ts)
    ↓
Spawns specialized Claude Code agents via Task tool:
    ├─ Requirements Agent (analyzes idea → generates specs)
    ├─ Coding Agent (writes complete application)
    ├─ Testing Agent (generates and runs tests)
    └─ Deployment Agent (deploys to production)
    ↓
Each agent saves output to ./output/ directory
    ↓
Orchestrator presents checkpoints for human approval
```

## Setup

1. **Navigate to the project:**
   ```bash
   cd ~/projects/autonomous-dev-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Shared Infrastructure (One-Time):**
   ```bash
   node scripts/setup-infrastructure.js
   ```

   This sets up database, AWS S3, Stripe, email once - all generated projects will use it!

   See [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md) for details.

That's it! No API keys for Claude needed.

## Usage

### 🎨 The Best Way: Slash Command + Visual Dashboard (Recommended!)

**Step 1:** Start the UI dashboard (in one terminal):
```bash
cd ui
npm install  # First time only
npm run dev
```

**Step 2:** Open http://localhost:3000 in your browser

**Step 3:** Use the `/build-app` command (in Claude Code):
```
/build-app A simple todo list with priorities and due dates
```

**That's it!** You'll see:
- ✨ Real-time pipeline visualization
- 🤖 Agent activity with progress bars
- 📝 Streaming logs
- ✅ Beautiful checkpoint modals in the browser
- 📁 Live file tree as code generates

The `/build-app` command automatically detects the UI is running and uses it!

**👀 Where to see updates?** See [WHERE_TO_SEE_UPDATES.md](WHERE_TO_SEE_UPDATES.md) for visual guide showing exactly where updates appear.

**💡 Port 3000 taken?** No problem! See [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md) for using custom ports.

### ⚡ Alternative: Slash Command Only (No UI)

If you don't want the visual dashboard, just run:

```
/build-app A simple todo list with priorities and due dates
```

Everything works in the terminal. You'll get text-based checkpoints.

**See [USAGE.md](USAGE.md) for detailed examples and guidance.**

### 🚀 Option 3: One-Command Launcher

Use the helper script that auto-starts the UI:

```bash
./start-with-ui.sh "Your app idea here"
```

This automatically:
1. Checks if UI is running (starts it if not)
2. Opens the connection
3. Runs the orchestrator
4. Shows everything in the dashboard

**Manual control with visual feedback:**

1. Start UI: `cd ui && npm run dev`
2. Run: `tsx orchestrate-ui.ts "Your app idea"`
3. Watch at http://localhost:3000

**Watch the magic happen:**
- See pipeline progress in real-time
- Monitor agent activity with live updates
- Review checkpoints in beautiful modals
- Preview generated code instantly
- Track everything in the activity log

### Option 5: Manual Orchestration (CLI only)

If you want more control:

```bash
# Step 1: Start orchestrator
tsx orchestrate.ts "My app idea description"

# Step 2: When orchestrator requests Requirements Agent
# Tell Claude Code: "Spawn requirements agent for the autonomous dev system"

# Step 3: Review and approve checkpoint

# Step 4: When orchestrator requests Coding Agent
# Tell Claude Code: "Spawn coding agent for the autonomous dev system"

# Continue through all phases...
```

## Agent Prompts

Located in `./agents/` directory:

- **requirements-agent-prompt.md**: Analyzes ideas, generates specifications
- **coding-agent-prompt.md**: Implements the complete application
- (More agents to be added: design, testing, deployment)

## 🚀 NEW: Shared Infrastructure

All generated projects now use **shared infrastructure**:

- **One PostgreSQL instance** - Each project gets its own database
- **One S3 bucket** - Files organized by project prefix
- **One Stripe account** - Separate products per project
- **One email service** - Shared across all projects

### Why?

Instead of creating new AWS accounts, databases, and services for every project:
- ✅ Configure once, use forever
- ✅ No duplicate services
- ✅ Lower costs (shared resources)
- ✅ Faster project generation
- ✅ Consistent setup

### How It Works

1. Run `node scripts/setup-infrastructure.js` once
2. Fill in `.env.shared` with your credentials
3. Generate apps with `/build-app`
4. Each app automatically gets:
   - Dedicated database: `project_name`
   - S3 prefix: `project-name/`
   - Pre-configured `.env` with shared credentials

See [INFRASTRUCTURE_SETUP.md](./INFRASTRUCTURE_SETUP.md) for full guide.

## Project Structure

```
autonomous-dev-system/
├── orchestrate.ts              # Main orchestrator script
├── agents/                     # Agent prompt templates
│   ├── requirements-agent-prompt.md
│   └── coding-agent-prompt.md
├── scripts/                    # Helper scripts
│   ├── setup-infrastructure.js # Infrastructure setup wizard
│   └── create-project-db.js   # Auto-create project databases
├── output/                     # Generated outputs
│   ├── project-state.json     # Workflow state
│   ├── requirements.json      # Generated requirements
│   ├── implementation.json    # Implementation summary
│   └── generated-project/     # Your generated app!
├── .env.shared                # Shared credentials (create this)
├── shared-infrastructure.json # Project registry
└── package.json
```

## Workflow Phases

### Phase 1: Requirements ✅
- Agent analyzes your app idea
- Asks clarifying questions if needed
- Generates comprehensive technical specifications
- **Checkpoint**: Review and approve requirements

### Phase 2: Design (Simplified in MVP)
- Uses requirements directly for coding
- Future: Will generate UI/UX wireframes and architecture diagrams

### Phase 3: Development ✅
- Agent generates complete application code
- Sets up project structure, auth, database, UI
- Creates documentation
- **Checkpoint**: Review generated code

### Phase 4: Testing (Coming Soon)
- Automated test generation
- Runs test suite
- **Checkpoint**: Review test results

### Phase 5: Deployment (Coming Soon)
- CI/CD setup
- Automated deployment to Vercel/Railway
- **Checkpoint**: Approve production deployment

## Example Session

```
User: "Build an autonomous app using ~/projects/autonomous-dev-system
       My idea: A simple todo list app with priorities"

Claude Code:
[Runs orchestrator.ts]

╔════════════════════════════════════════════════════════════════════════════╗
║           AUTONOMOUS DEV SYSTEM - Claude Code Agent Edition               ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 Project ID: proj-1710425678901
📍 Current Phase: init

═══════════════════════════════════════════════════════════════════════════
PHASE 1: REQUIREMENTS GATHERING
═══════════════════════════════════════════════════════════════════════════

[Claude spawns Requirements Agent using Task tool]
[Agent creates output/requirements.json]

════════════════════════════════════════════════════════════════════════════
🔔 CHECKPOINT: Requirements Review
════════════════════════════════════════════════════════════════════════════

📋 Artifact Preview:
{
  "projectName": "QuickTask",
  "description": "A simple, intuitive todo list application...",
  ...
}

Options: [1] Approve  [2] Reject  [3] View Full
Your choice (1-3): 1

✅ Requirements approved!

═══════════════════════════════════════════════════════════════════════════
PHASE 3: DEVELOPMENT
═══════════════════════════════════════════════════════════════════════════

[Claude spawns Coding Agent using Task tool]
[Agent creates complete application in output/generated-project/]

🎉 PROJECT COMPLETE!
Your application: output/generated-project/
```

## Generated App Structure

For Next.js + PostgreSQL apps:

```
output/generated-project/
├── app/
│   ├── api/               # API routes
│   ├── (auth)/           # Auth pages
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utilities
├── prisma/               # Database schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md             # Setup instructions
```

## Benefits of Claude Code Agents

✅ **No API Keys**: Uses your Claude Code subscription
✅ **Full Tool Access**: Agents can Read, Write, Edit files, run Bash commands
✅ **Integrated**: Works within your existing Claude Code workflow
✅ **Transparent**: See exactly what each agent is doing
✅ **Cost-Effective**: No per-token charges
✅ **Powerful**: Agents have same capabilities as Claude Code

## Checkpoints

Human approval required at these milestones:
1. **Requirements Review**: Validate specifications
2. **Implementation Review**: Review generated code
3. **Testing Approval**: Review test results (coming soon)
4. **Deployment Approval**: Approve production deployment (coming soon)

## Tips for Best Results

1. **Be Specific**: Provide clear, detailed app descriptions
2. **Iterate**: Don't hesitate to reject and ask for revisions
3. **Review Carefully**: Inspect generated code at checkpoints
4. **Test Thoroughly**: Manually test the generated app
5. **Customize**: The generated code is a starting point - make it yours!

## Limitations (MVP v0.1.0)

- Only Requirements and Development phases fully implemented
- Testing and Deployment require manual steps
- Design phase simplified (no visual wireframes yet)
- One app at a time (clean output/ between projects)

## Roadmap

- [ ] Visual design generation (wireframes, mockups)
- [ ] Automated testing with Playwright
- [ ] CI/CD pipeline setup
- [ ] One-click deployment
- [ ] Mobile app generation (React Native)
- [ ] Iterative improvements based on feedback
- [ ] Multiple tech stack templates

## Comparison to Original Architecture

**Before**: External API calls, API keys, complex dependencies
**Now**: Pure Claude Code agents, no external dependencies, simpler architecture

**Before**: Needed LangGraph, LangChain, Anthropic SDK
**Now**: Just needs tsx to run TypeScript

**Before**: Complex state management and orchestration
**Now**: Simple script + file-based state

## Contributing

This is an MVP. Future enhancements:
- More agent types (design, testing, deployment)
- Better error handling
- Parallel agent execution
- Advanced state management
- Cost/token tracking

## License

MIT
