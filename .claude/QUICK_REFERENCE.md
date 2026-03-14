# Quick Reference Guide

## TL;DR

**What:** Autonomous app builder using Claude Code agents
**Where:** `~/Projects/autonomous-dev-system/`
**Status:** MVP complete, ready to use

## Build an App (3 Ways)

1. **Slash Command:** `/build-app A simple todo list` (may need session restart)
2. **Direct:** "Build me a [app description]"
3. **Manual:** `tsx orchestrate.ts "App idea"`

## How It Works

```
User idea → Requirements Agent → Checkpoint → Coding Agent → Checkpoint → Done
```

## Key Files

| File | Purpose |
|------|---------|
| `orchestrate.ts` | Workflow coordinator |
| `agents/requirements-agent-prompt.md` | Requirements generation template |
| `agents/coding-agent-prompt.md` | Code generation template |
| `.claude/commands/build-app.md` | Slash command definition |
| `output/requirements.json` | Generated specs |
| `output/generated-project/` | Your complete app |

## Spawn an Agent

```
Use Task tool with subagent_type="general-purpose"
Load prompt from: agents/[agent-name]-prompt.md
Replace placeholders: {{USER_INPUT}}, {{PROJECT_CONTEXT}}, etc.
Agent saves output to: output/
```

## Generated App Setup

```bash
cd output/generated-project
npm install
cp .env.example .env  # Edit with DATABASE_URL
npx prisma migrate dev
npm run dev
```

## Clean Between Projects

```bash
npm run clean
```

## Architecture

- ❌ NO API calls
- ❌ NO API keys needed
- ✅ Uses Claude Code Task tool
- ✅ Agents have full file/bash access
- ✅ File-based state in `output/`

## Current Phase Support

| Phase | Status |
|-------|--------|
| Requirements | ✅ Fully implemented |
| Design | ⚠️ Skipped (uses requirements directly) |
| Development | ✅ Fully implemented |
| Testing | ⏳ Manual instructions provided |
| Deployment | ⏳ Manual instructions provided |

## Tech Stack (Generated Apps)

- Next.js 14+ (App Router)
- TypeScript
- PostgreSQL + Prisma
- NextAuth.js
- Tailwind CSS

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Slash command not found | Use direct request or restart session |
| Agent stuck | Check `output/` for partial results |
| Want fresh start | `npm run clean` |
| App won't run | Follow setup steps above |

## Read More

- `PROJECT_KNOWLEDGE.md` - Complete context
- `README.md` - Full documentation
- `USAGE.md` - Detailed usage guide
- `WHATS_CHANGED.md` - Why we refactored
