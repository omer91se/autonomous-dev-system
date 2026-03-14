# Claude Knowledge Base

This directory contains knowledge files for AI sessions to understand and continue work on this project.

## Files

### 📚 [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md)
**Complete project context and session summary**

Read this first if you need to:
- Understand the full project history
- Know what was built and why
- Learn the architecture and design decisions
- Continue development work
- Understand what's implemented vs. planned

**Contents:**
- Project overview
- Architectural evolution (why we refactored)
- Complete file structure explanation
- How the system works (detailed)
- Agent execution model
- Implementation status
- Usage instructions
- Common issues and solutions
- Future enhancement roadmap

### ⚡ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
**Quick lookup guide**

Read this when you need:
- Fast reference while working
- Quick command lookup
- File location reminders
- Troubleshooting tips

**Contents:**
- How to build an app (3 methods)
- Key files table
- Agent spawning instructions
- Setup commands
- Current phase support
- Tech stack info
- Troubleshooting table

### 🤖 [build-app.md](commands/build-app.md)
**Slash command definition**

This is the `/build-app` command that automates the entire workflow.

**Usage:** `/build-app [app description]`

---

## For New AI Sessions

### Starting Fresh
1. Read `QUICK_REFERENCE.md` (2 min)
2. Skim `PROJECT_KNOWLEDGE.md` (5 min)
3. You're ready to help the user!

### Continuing Development
1. Read full `PROJECT_KNOWLEDGE.md`
2. Check `output/project-state.json` for current state
3. Review parent directory's `README.md` and `USAGE.md`

### Building an App for User
1. Get their app idea
2. Follow instructions in `QUICK_REFERENCE.md` under "Spawn an Agent"
3. Or read the detailed flow in `PROJECT_KNOWLEDGE.md` under "How It Works"

---

## Parent Directory Structure

```
~/Projects/autonomous-dev-system/
├── .claude/                    # ← You are here
│   ├── README.md              # This file
│   ├── PROJECT_KNOWLEDGE.md   # Full context
│   ├── QUICK_REFERENCE.md     # Quick guide
│   └── commands/
│       └── build-app.md       # Slash command
├── agents/                    # Agent prompt templates
│   ├── requirements-agent-prompt.md
│   └── coding-agent-prompt.md
├── output/                    # Generated artifacts
├── orchestrate.ts            # Main coordinator
└── [documentation files]
```

---

## Quick Start (For AI)

**User wants to build an app?**

→ Read `QUICK_REFERENCE.md` → Spawn agents → Done

**Need full context?**

→ Read `PROJECT_KNOWLEDGE.md` → Understand everything

**Continuing previous work?**

→ Check `output/project-state.json` → Resume from checkpoint

---

## Key Concept

This system uses **Claude Code agents** (spawned via Task tool) instead of external API calls.

**Workflow:**
```
User idea
  ↓
Spawn requirements agent (Task tool)
  ↓
Generate requirements.json
  ↓
User approves
  ↓
Spawn coding agent (Task tool)
  ↓
Generate complete app in output/generated-project/
  ↓
User approves
  ↓
Done!
```

**No API keys. No external costs. Just Claude Code orchestrating Claude Code agents.**

---

## Last Session Summary

**Date:** March 14, 2026

**What was accomplished:**
- ✅ Built autonomous app development system
- ✅ Refactored from API-based to Claude Code agent architecture
- ✅ Created requirements and coding agents
- ✅ Implemented checkpoint system
- ✅ Created comprehensive documentation
- ✅ Added slash command `/build-app`
- ✅ System ready to use

**Current status:** MVP complete, fully functional, ready to build apps

**User can now:** Type `/build-app [idea]` or just ask "Build me a [app]"

---

Ready to build amazing apps! 🚀
