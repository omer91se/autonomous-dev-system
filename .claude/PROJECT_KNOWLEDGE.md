# Project Knowledge: Autonomous Dev System

**Last Updated:** March 14, 2026
**Status:** MVP Complete - Ready to Use
**Location:** `~/Projects/autonomous-dev-system/`

---

## Project Overview

This is an **Autonomous Web/Mobile App Development System** that takes a user's app idea and autonomously builds a complete, production-ready application using Claude Code agents.

### What It Does

User provides an app idea → System autonomously:
1. Analyzes the idea and generates technical specifications
2. Asks clarifying questions if needed
3. Builds the complete application (Next.js + PostgreSQL)
4. Presents checkpoints for human approval
5. Delivers production-ready code

### Key Innovation

Instead of making external API calls, the system uses **Claude Code's Task tool** to spawn specialized Claude Code agents. This means:
- ✅ No API keys needed
- ✅ No external costs (uses Claude Code subscription)
- ✅ Full access to file operations, bash, and all Claude Code tools
- ✅ Simple, transparent, and powerful

---

## Architectural Evolution

### Original Design (Abandoned)
- Made external Anthropic API calls
- Required `ANTHROPIC_API_KEY`
- Heavy dependencies: LangChain, LangGraph, Anthropic SDK, Winston, Zod
- Complex state management with TypeScript types
- ~1000+ lines of code
- Per-token costs

### Current Design (Implemented)
- Uses Claude Code agents via Task tool
- No API keys required
- Minimal dependencies: just `tsx` and `uuid`
- Simple file-based state in `output/`
- ~200 lines of orchestration code
- No additional costs

**Why We Changed:** Realized we were already talking to Claude, so why make external API calls? Just spawn specialized Claude Code agents directly.

---

## Project Structure

```
~/Projects/autonomous-dev-system/
├── .claude/
│   ├── commands/
│   │   └── build-app.md          # Slash command for automatic building
│   └── PROJECT_KNOWLEDGE.md      # This file
├── agents/
│   ├── requirements-agent-prompt.md  # Requirements generation template
│   └── coding-agent-prompt.md       # Code generation template
├── output/                       # Generated artifacts
│   ├── project-state.json       # Workflow state
│   ├── requirements.json        # Generated specs
│   ├── implementation.json      # Implementation summary
│   └── generated-project/       # Complete generated app
├── orchestrate.ts               # Main workflow coordinator
├── package.json                 # Just tsx + uuid
├── README.md                    # Main documentation
├── USAGE.md                     # Detailed usage guide
├── QUICKSTART.md                # Quick start guide
└── WHATS_CHANGED.md             # Explains the refactoring
```

---

## How It Works

### Workflow Phases

1. **Requirements Phase**
   - Agent: `agents/requirements-agent-prompt.md`
   - Input: User's app idea
   - Output: `output/requirements.json`
   - Checkpoint: User approves requirements

2. **Design Phase** (Simplified in MVP)
   - Currently skipped - uses requirements directly
   - Future: Will generate UI wireframes and architecture diagrams

3. **Development Phase**
   - Agent: `agents/coding-agent-prompt.md`
   - Input: Approved requirements
   - Output: `output/generated-project/` (complete Next.js app)
   - Creates: `output/implementation.json`
   - Checkpoint: User approves implementation

4. **Testing Phase** (Not Yet Implemented)
   - Future: Automated test generation

5. **Deployment Phase** (Not Yet Implemented)
   - Future: CI/CD setup and automated deployment

### Agent Execution Model

```
User triggers build
    ↓
orchestrate.ts runs (workflow coordinator)
    ↓
Orchestrator requests agent spawn
    ↓
Claude Code spawns agent via Task tool
    ↓
Agent reads prompt template from agents/
    ↓
Agent executes (has full file/bash access)
    ↓
Agent saves output to output/
    ↓
Orchestrator presents checkpoint
    ↓
User approves → Continue
User rejects → Revise
```

---

## Current Implementation Status

### ✅ Fully Implemented
- Requirements generation with clarifying questions
- Complete Next.js application generation
- TypeScript throughout
- Authentication system
- Database setup (Prisma + PostgreSQL)
- Responsive UI (Tailwind CSS)
- File-based state management
- Checkpoint approval system
- Slash command `/build-app`

### ⏳ Planned (Not Implemented)
- Visual design generation (wireframes, mockups)
- Automated testing (unit, integration, e2e)
- CI/CD pipeline setup
- Automated deployment
- Mobile app generation (React Native)
- Multiple tech stack support (currently Next.js + PostgreSQL only)

---

## How to Use

### Method 1: Slash Command (Intended but may need session restart)
```
/build-app A simple todo list with priorities
```

### Method 2: Direct Request (Always Works)
User says: "Build me a [app description]"

Claude Code should:
1. Spawn requirements agent using Task tool
2. Load prompt from `agents/requirements-agent-prompt.md`
3. Replace `{{USER_INPUT}}` with the app description
4. Agent generates `output/requirements.json`
5. Present checkpoint to user
6. If approved, spawn coding agent
7. Load prompt from `agents/coding-agent-prompt.md`
8. Agent generates complete app in `output/generated-project/`
9. Present final checkpoint
10. Done!

### Method 3: Manual Orchestration
```bash
cd ~/Projects/autonomous-dev-system
tsx orchestrate.ts "App idea description"
# Then Claude spawns agents as requested
```

---

## Agent Prompts Explained

### Requirements Agent (`agents/requirements-agent-prompt.md`)

**Input:** User's app idea (via `{{USER_INPUT}}` placeholder)

**Process:**
1. Analyzes the idea
2. If too vague → Creates `output/questions.json` with clarifying questions
3. If clear enough → Creates `output/requirements.json` with:
   - Project name and description
   - User stories with acceptance criteria
   - Functional requirements
   - Non-functional requirements (performance, security, etc.)
   - Tech stack recommendation
   - Success metrics

**Tools Used:** Write (to create JSON files)

### Coding Agent (`agents/coding-agent-prompt.md`)

**Input:**
- `{{PROJECT_CONTEXT}}` - Project name
- `{{TECH_STACK}}` - Tech stack from requirements
- Reads `output/requirements.json`

**Process:**
1. Reads requirements
2. Creates complete Next.js application:
   - Authentication system (NextAuth.js)
   - Database schema (Prisma)
   - API routes
   - UI components (React + Tailwind)
   - All features from requirements
3. Creates documentation
4. Saves to `output/generated-project/`
5. Creates `output/implementation.json` summary

**Tools Used:** Write, Bash (npm init, etc.), Read

---

## Generated Application Structure

Every generated app follows this structure:

```
output/generated-project/
├── app/
│   ├── api/              # Backend API routes
│   ├── (auth)/           # Authentication pages
│   └── page.tsx          # Home page
├── components/
│   ├── ui/              # Reusable UI components
│   └── [features]/      # Feature-specific components
├── lib/
│   ├── auth.ts          # Auth logic
│   ├── db.ts            # Database connection
│   └── utils.ts         # Utilities
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── package.json
├── tsconfig.json
├── .env.example         # Environment variables template
└── README.md            # Setup instructions
```

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth.js (authentication)
- Tailwind CSS
- React Hook Form + Zod (forms/validation)

---

## Key Files to Know

### `orchestrate.ts`
- Main workflow coordinator (~200 lines)
- Manages phase transitions
- Presents checkpoints
- Saves state to `output/project-state.json`
- **Does NOT spawn agents directly** - instructs Claude Code to spawn them

### `.claude/commands/build-app.md`
- Slash command definition
- Tells Claude Code how to autonomously execute the entire workflow
- Uses Task tool to spawn agents
- Handles checkpoints automatically

### `agents/requirements-agent-prompt.md`
- Template for requirements generation
- Contains instructions for the agent
- Defines output format
- Has examples for good requirements

### `agents/coding-agent-prompt.md`
- Template for code generation
- Comprehensive checklist for implementation
- Defines generated app structure
- Best practices and guidelines

---

## State Management

### Location
All state stored in `output/` directory:
- `project-state.json` - Current workflow state
- `requirements.json` - Generated requirements
- `implementation.json` - Implementation summary
- `generated-project/` - The actual application

### State Schema
```json
{
  "projectId": "proj-1234567890",
  "phase": "development",
  "userInput": "Original app idea",
  "requirementsPath": "output/requirements.json",
  "implementationPath": "output/implementation.json",
  "checkpoints": [
    {
      "id": "cp-123",
      "type": "requirements_review",
      "status": "approved",
      "timestamp": "2026-03-14T..."
    }
  ],
  "createdAt": "2026-03-14T..."
}
```

### Resuming Projects
If `output/project-state.json` exists, the orchestrator can resume from the last checkpoint.

---

## Common Issues & Solutions

### Issue: Slash command not recognized
**Cause:** Claude Code hasn't reloaded commands
**Solution:**
1. Try `/restart` to restart Claude Code
2. Or just ask directly: "Build me a [app]"

### Issue: Agent doesn't complete
**Cause:** Agent encountered an error or got stuck
**Solution:**
1. Check `output/` for partial results
2. Can manually spawn agent again with Task tool
3. Check orchestrate.ts for phase state

### Issue: Generated app won't run
**Cause:** Missing setup steps
**Solution:** User needs to:
```bash
cd output/generated-project
npm install
cp .env.example .env
# Edit .env with DATABASE_URL
npx prisma migrate dev
npm run dev
```

### Issue: Want to build another app
**Cause:** Output directory contains previous project
**Solution:**
```bash
npm run clean  # Clears output/
# Or manually: rm -rf output && mkdir output
```

---

## Important Context for Future Sessions

### What Works
- ✅ Requirements generation (with clarifications)
- ✅ Complete Next.js app generation
- ✅ Checkpoint system
- ✅ File-based state

### What's Stubbed Out
- ⚠️ Design phase (currently skipped)
- ⚠️ Testing phase (manual instructions provided)
- ⚠️ Deployment phase (manual instructions provided)

### Tech Stack Limitations
Currently only supports:
- Next.js + PostgreSQL

Future should support:
- Next.js + MongoDB
- React + Node.js + PostgreSQL
- React + Node.js + MongoDB
- React Native (mobile)

### Dependencies
Minimal by design:
- `tsx` - TypeScript execution
- `uuid` - Unique ID generation

NO dependencies on:
- ❌ Anthropic SDK
- ❌ LangChain/LangGraph
- ❌ MCP SDK
- ❌ Winston/logging
- ❌ Zod (in orchestrator)

---

## Next Steps for Enhancement

### Short Term
1. Fix slash command recognition (may need Claude Code update)
2. Add more example prompts for agents
3. Improve error handling in orchestrator

### Medium Term
1. Implement design agent (UI wireframes)
2. Implement testing agent (automated tests)
3. Add support for Next.js + MongoDB
4. Better state recovery/resumption

### Long Term
1. Deployment automation (Vercel, Railway)
2. CI/CD pipeline generation
3. Mobile app support (React Native)
4. Marketing/SEO agent
5. Iterative improvement based on user feedback

---

## User's Original Request

User wanted to create a fully autonomous system for web/mobile app development that:
- Takes an app idea as input
- Handles design, coding, database, testing, marketing, deployment
- Everything automated with checkpoints for approval

**What we delivered (MVP):**
- ✅ Autonomous requirements generation
- ✅ Autonomous code generation (complete Next.js apps)
- ✅ Checkpoint approvals
- ✅ Simple, Claude Code-native architecture
- ⏳ Testing, deployment, marketing (planned for future)

---

## How a New AI Session Should Continue

### To Resume Work on This Project:
1. Read this file for context
2. Review `README.md` and `USAGE.md`
3. Check `output/` for any existing state
4. If building a new app, run `npm run clean` first

### To Help User Build an App:
1. Ask for their app idea
2. Spawn requirements agent:
   ```
   Use Task tool with subagent_type="general-purpose"
   Read: agents/requirements-agent-prompt.md
   Replace {{USER_INPUT}} with user's idea
   Agent will create output/requirements.json
   ```
3. Present requirements checkpoint
4. If approved, spawn coding agent:
   ```
   Use Task tool with subagent_type="general-purpose"
   Read: agents/coding-agent-prompt.md
   Replace placeholders with requirements data
   Agent will create output/generated-project/
   ```
5. Present implementation checkpoint
6. Provide setup instructions

### To Enhance the System:
- Add new agent prompts in `agents/` directory
- Update `orchestrate.ts` to include new phases
- Add new tech stack templates
- Improve agent prompts based on results
- Add automated testing/deployment phases

---

## Example Session Flow

```
User: "Build me a todo list app"

AI: [Spawns requirements agent via Task tool]
    [Agent creates output/requirements.json]

    "I've analyzed your idea. Here are the requirements:
     - Project: QuickTask
     - Features: Task CRUD, priorities, due dates
     - Tech: Next.js + PostgreSQL

     Approve? (yes/no)"

User: "yes"

AI: [Spawns coding agent via Task tool]
    [Agent creates complete app in output/generated-project/]

    "App generated! 47 files created.
     Features: ✓ Auth ✓ Tasks ✓ Priorities ✓ Due dates

     Approve? (yes/no)"

User: "yes"

AI: "🎉 Complete! Your app: output/generated-project/

     Setup:
     cd output/generated-project
     npm install
     cp .env.example .env
     npx prisma migrate dev
     npm run dev"
```

---

## Critical Understanding

**The system does NOT make API calls.** It's a meta-orchestration layer that:
1. Coordinates workflow phases
2. Instructs Claude Code (via Task tool) to spawn agents
3. Manages state and checkpoints
4. Presents results to the user

**Claude Code is both:**
- The orchestrator (running orchestrate.ts)
- The agent executor (spawning specialized agent instances)

This is possible because Claude Code can spawn multiple instances of itself via the Task tool, each with specialized prompts and full tool access.

---

## Success Metrics

A successful build includes:
- ✅ Requirements JSON with 5+ user stories
- ✅ Complete Next.js app structure
- ✅ Authentication implemented
- ✅ Database schema created
- ✅ All features from requirements implemented
- ✅ TypeScript with no errors
- ✅ Responsive UI
- ✅ README with setup instructions
- ✅ .env.example with required variables

---

## Final Notes

This project represents a successful pivot from a complex API-based architecture to a simple, powerful Claude Code-native solution. The key insight was: "Why call the Claude API when we're already talking to Claude?"

The current MVP (v0.1.0) successfully demonstrates autonomous requirements generation and code generation. Future versions will add testing, deployment, and additional tech stacks.

**Location:** `~/Projects/autonomous-dev-system/`
**Status:** Ready to use
**Next Session:** Can immediately start building apps or enhancing the system

---

**End of Project Knowledge Document**
