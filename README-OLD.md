# Autonomous Dev System

An autonomous web/mobile app development system that takes an app idea and develops it to production with design, coding, database, testing, and deployment - all with checkpoint approvals at major milestones.

## Architecture

- **Orchestration**: LangGraph (graph-based workflow with state management)
- **Pattern**: Supervisor agent coordinating specialized sub-agents
- **Foundation**: Claude Code extended via custom MCP servers
- **Tech Stack**: Next.js/React + Node.js + PostgreSQL/MongoDB

## Features

### Phase 1: MVP (Current)
- ✅ Basic orchestrator with state machine
- ✅ Requirements agent (idea → structured specs)
- ✅ Claude Code integration for coding
- ✅ 3 checkpoints: Requirements, Code Review, Deployment
- ✅ Support for Next.js + PostgreSQL stack

### Phase 2: Multi-Agent (Planned)
- Specialized agents: Frontend, Backend, Database, Testing
- External tool integrations (UX Pilot, Workik AI, Octomind)
- Context compaction (84% token reduction target)
- Automated quality gates

### Phase 3: Production (Planned)
- DevOps agent with CI/CD automation
- GitHub Agentic Workflows integration
- Full checkpoint system with approval interface
- Robust error handling and cost optimization

### Phase 4: Advanced (Planned)
- Mobile app support (React Native)
- Marketing agents (SEO, analytics, content)
- Performance optimization and security hardening

## Project Structure

```
autonomous-dev-system/
├── mcp-servers/              # Custom MCP servers
│   ├── orchestrator/
│   ├── design-tools/
│   ├── testing/
│   └── deployment/
├── agents/                   # Agent configurations
├── prompts/                  # Specialized prompts
│   ├── system/              # System prompts per agent
│   ├── tools/               # Tool documentation
│   └── checkpoints/         # Checkpoint templates
├── workflows/               # LangGraph workflow definitions
├── state/                   # State management
├── templates/              # Project templates
│   ├── nextjs-postgres/
│   └── react-mongodb/
└── config/                 # Configuration files
```

## Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

3. Run in development mode:
```bash
npm run dev
```

## Usage

```bash
# Start the autonomous development system
npm run dev

# Provide an app idea when prompted
# Example: "A task management app with team collaboration"

# Review and approve checkpoints:
# 1. Requirements Specification
# 2. Code Implementation
# 3. Deployment Plan
```

## Configuration

See `.env.example` for all configuration options including:
- Model selection (primary and economical models)
- Cost limits and tracking
- Checkpoint approval modes
- Context management settings

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Cost Optimization

The system implements several cost optimization strategies:
- Multi-model routing (use economical models for simple tasks)
- Context compaction (84% token reduction)
- Caching system prompts and tool documentation
- Budget-aware agents with cost tracking

Expected cost per app: $5-10 (with optimization)

## Checkpoints

The system pauses for human approval at these milestones:
1. **Requirements Review**: Validate specifications and user stories
2. **Architecture & Design**: Approve technical design and database schema
3. **Implementation Review**: Review generated code and functionality
4. **Testing Approval**: Validate test strategy and results
5. **Pre-Deployment**: Verify staging deployment
6. **Production Deployment**: Final approval before going live
7. **Post-Deployment**: Confirm production health

## License

MIT
