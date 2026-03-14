# Multi-Agent Workflow v2.0

## Overview

The Autonomous Development System now uses a **7-Agent Professional Workflow** that mimics a real software development team. Each specialized agent handles a specific phase of development, with built-in checkpoints for quality control and user approval.

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   AUTONOMOUS APP BUILDER v2.0                              ║
║                    7-Agent Professional Workflow                           ║
╚════════════════════════════════════════════════════════════════════════════╝

PHASE 1: BUSINESS STRATEGY (CEO Agent)
        ↓
        🔔 CHECKPOINT 1: Business Plan Approval
        ↓
PHASE 2: PRODUCT SPECIFICATION (PM Agent)
        ↓
        🔔 CHECKPOINT 2: Product Spec Approval
        ↓
PHASE 3: TECHNICAL DESIGN (Designer + Architect IN PARALLEL)
        ↓
        🔔 CHECKPOINT 3: Design & Architecture Review
        ↓
PHASE 4: BACKEND DEVELOPMENT (Backend Developer)
        ↓
PHASE 5: FRONTEND DEVELOPMENT (Frontend Developer)
        ↓
        🔔 CHECKPOINT 4: Implementation Review
        ↓
PHASE 6: QUALITY ASSURANCE (QA Agent)
        ↓
        🔔 CHECKPOINT 5: QA Approval
        ↓
PHASE 7: COMPLETION
```

## The 7-Agent Team

### 1. CEO Agent - Business Strategy

**Role:** Validates business viability before any development begins

**Inputs:**
- User's app idea

**Responsibilities:**
- Business model validation (revenue streams, pricing, unit economics)
- Market analysis (target market, TAM/SAM/SOM, trends)
- Competitive landscape analysis
- Budget and resource planning
- Risk assessment (technical, market, business, legal)
- Strategic recommendation (BUILD | PIVOT | NOT_RECOMMENDED)

**Outputs:**
- `output/business-plan.json` - Complete business plan with market analysis

**Prompt File:** `agents/ceo-agent-prompt.md`

---

### 2. PM Agent - Product Specification

**Role:** Deep UX research and detailed product specifications

**Inputs:**
- User's app idea
- `output/business-plan.json`

**Responsibilities:**
- Deep UX research on similar successful products
- User personas with detailed demographics and psychographics
- Complete user journey mapping
- **Page-by-page specifications** with sections, components, actions, and states
- **Step-by-step user flows** with error handling
- Feature prioritization using RICE scoring
- Release roadmap (MVP → Phase 2 → Phase 3)

**Outputs:**
- `output/product-spec.json` - Comprehensive product specification

**Prompt File:** `agents/pm-agent-prompt.md`

**Key Feature:** This agent does extensive research to understand best UX practices and describes every page and flow in detail.

---

### 3a. FE Designer Agent - Design System & Mockups

**Role:** Creates complete design system and visual mockups

**Inputs:**
- `output/product-spec.json`

**Responsibilities:**
- Design system with color palette, typography, spacing, shadows
- Component specifications for all UI elements
- Responsive breakpoint strategy
- Accessibility guidelines (WCAG 2.1 AA)
- Page mockups with layout, sections, components
- Animation and micro-interaction specifications

**Outputs:**
- `output/design-system.json` - Complete design system
- `output/mockups/` - Page mockups and component examples

**Prompt File:** `agents/designer-agent-prompt.md`

**Execution:** Runs **IN PARALLEL** with BE Architect Agent

---

### 3b. BE Architect Agent - System Architecture

**Role:** Designs system architecture, database, and API contracts

**Inputs:**
- `output/product-spec.json`
- `output/business-plan.json` (for scale/budget context)

**Responsibilities:**
- System architecture design (deployment, components, data flow)
- Optimized database schema with indexes
- RESTful API design with OpenAPI 3.0 specification
- Authentication/authorization strategy
- Performance and scalability strategy (caching, load balancing)
- Security architecture (encryption, CORS, rate limiting)
- Third-party integration architecture

**Outputs:**
- `output/architecture.json` - System architecture documentation
- `output/api-contracts.yaml` - OpenAPI 3.0 specification

**Prompt File:** `agents/architect-agent-prompt.md`

**Execution:** Runs **IN PARALLEL** with FE Designer Agent

---

### 4. Backend Developer Agent - API Implementation

**Role:** Implements backend infrastructure and API endpoints

**Inputs:**
- `output/architecture.json`
- `output/api-contracts.yaml`
- `output/product-spec.json`

**Responsibilities:**
- Prisma database schema implementation
- API route implementation per OpenAPI spec
- NextAuth.js authentication system
- Request/response validation with Zod
- Business logic and transaction management
- Third-party integrations (Stripe, S3, email)
- Error handling middleware

**Outputs:**
- `output/generated-project/app/api/` - API routes
- `output/generated-project/lib/` - Utilities and services
- `output/generated-project/prisma/` - Database schema

**Prompt File:** `agents/backend-developer-prompt.md`

**Execution:** Runs **SEQUENTIALLY** after architecture phase, **BEFORE** Frontend

---

### 5. Frontend Developer Agent - UI Implementation

**Role:** Implements user interface and integrates with backend

**Inputs:**
- `output/design-system.json`
- `output/mockups/`
- `output/api-contracts.yaml`
- `output/product-spec.json`
- `output/generated-project/app/api/` (backend code)

**Responsibilities:**
- React component implementation per design specs
- Page implementation matching mockups pixel-perfect
- State management (React Query for server state)
- API integration with error handling
- Form handling with client-side validation
- Accessibility implementation (ARIA, keyboard nav)
- **Test ID implementation** - adds `data-testid` attributes to all interactive elements for reliable E2E testing

**Outputs:**
- `output/generated-project/components/` - React components
- `output/generated-project/app/` - Pages and layouts
- `output/generated-project/styles/` - Tailwind config

**Prompt File:** `agents/frontend-developer-prompt.md`

**Execution:** Runs **SEQUENTIALLY** after Backend Developer

---

### 6. QA & Tester Agent - Quality Assurance

**Role:** Comprehensive testing and quality assurance with **automated E2E testing**

**Inputs:**
- `output/product-spec.json`
- `output/generated-project/`
- `output/architecture.json`

**Responsibilities:**
- Test plan creation with test cases for all user stories
- **E2E test generation and execution with Playwright** (browser automation)
  - Authentication flows (signup, login, logout, password reset)
  - Critical user journeys (checkout, profile updates, etc.)
  - Form validation and error handling
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Visual regression testing with screenshots
- **Accessibility testing with axe-core**
  - WCAG 2.1 AA compliance checking
  - Keyboard navigation verification
  - Screen reader compatibility
- Unit test generation (Jest/Vitest)
- API integration testing
- Performance testing (Lighthouse audits, load times)
- Security testing (OWASP top 10)
- **Actual test execution** - runs all tests and reports real results

**Key Feature:** The QA agent doesn't just generate test files - it **actually runs Playwright tests** in a headless browser, captures screenshots of failures, and reports real test results with metrics.

**Outputs:**
- `output/generated-project/playwright.config.ts` - Playwright configuration
- `output/generated-project/tests/e2e/` - Playwright E2E tests
- `output/test-plan.json` - Complete test plan
- `output/generated-project/tests/` - All test files
- `output/test-results.json` - Test execution results
- `output/qa-report.md` - Findings and recommendations

**Prompt File:** `agents/qa-agent-prompt.md`

---

## The 5 Checkpoints

### Checkpoint 1: Business Plan Approval
**After:** CEO Agent completes business strategy
**Shows:**
- Business model and revenue streams
- Market size (TAM/SAM/SOM)
- Competitive advantage
- Budget breakdown
- Risk assessment
- Strategic recommendation

**User Decision:** Approve to proceed or reject to modify

---

### Checkpoint 2: Product Spec Approval
**After:** PM Agent completes product specification
**Shows:**
- User personas
- Key pages and features
- User flows
- Feature priorities (must-have, should-have, could-have)
- Release roadmap

**User Decision:** Approve to proceed or request changes

---

### Checkpoint 3: Design & Architecture Review
**After:** Designer and Architect complete (in parallel)
**Shows:**
- Design system highlights (colors, typography, components)
- Sample component mockups
- Architecture overview
- API endpoint summary
- Database schema overview

**User Decision:** Approve technical design or request revisions

---

### Checkpoint 4: Implementation Review
**After:** Backend and Frontend Developers complete
**Shows:**
- Files created
- Features implemented
- API endpoints created
- Pages built
- Integration summary

**User Decision:** Approve implementation or request fixes

---

### Checkpoint 5: QA Approval
**After:** QA Agent completes testing
**Shows:**
- Test coverage percentage
- Passing/failing tests
- Performance metrics
- Security findings
- Accessibility audit results

**User Decision:** Approve for production or request bug fixes

---

## Parallel vs Sequential Execution

### Parallel Execution (Phase 3)
The **Designer** and **Architect** agents work **simultaneously** because:
- They have the same input (product spec)
- They work on independent outputs (design vs architecture)
- No dependencies between their work
- Saves time by running in parallel

### Sequential Execution (Phases 4-5)
The **Backend Developer** must complete **before** **Frontend Developer** because:
- Frontend needs to integrate with actual backend API endpoints
- Frontend developer can reference backend implementation
- Ensures API contracts match implementation
- Prevents integration issues

---

## Comparison: Old vs New Workflow

### Old Workflow (v1.0)
```
2 Agents:
1. Requirements Agent → generates requirements.json
2. Coding Agent → generates complete app

2 Checkpoints:
1. Requirements approval
2. Implementation approval
```

**Limitations:**
- No business validation
- No deep UX research
- No separation of concerns
- Design and architecture lumped together
- No dedicated QA phase

### New Workflow (v2.0)
```
7 Specialized Agents:
1. CEO → business plan
2. PM → product spec
3. Designer + Architect (parallel) → design system + architecture
4. Backend Developer → API implementation
5. Frontend Developer → UI implementation
6. QA → comprehensive testing

5 Checkpoints for quality gates
```

**Improvements:**
- Business viability check before development
- Deep UX research and page-by-page specs
- Professional separation of concerns
- Parallel execution where possible
- Dedicated QA and testing phase
- Production-ready output

---

## How to Use

### Two Workflows Available

#### 1. Build New App - `/build-app`
For creating a brand new application from an idea

```bash
# Use the /build-app command with your idea
/build-app a fitness coaching platform where trainers can create workout plans
```

#### 2. Improve Existing App - `/improve-app`
For enhancing an existing application in `output/generated-project/`

```bash
# Use the /improve-app command to enhance your app
/improve-app add user notifications and improve performance
```

---

### Building a New App (`/build-app`)

### What Happens

1. **Phase 1**: CEO Agent analyzes business viability
   - You review and approve business plan

2. **Phase 2**: PM Agent creates detailed product spec
   - You review and approve product specification

3. **Phase 3**: Designer + Architect work in parallel
   - You review and approve design & architecture

4. **Phase 4**: Backend Developer implements API

5. **Phase 5**: Frontend Developer implements UI
   - You review and approve implementation

6. **Phase 6**: QA Agent generates and runs tests
   - You review and approve QA report

7. **Phase 7**: Complete! Your production-ready app is generated

### Generated Artifacts

After completion, you'll have:

```
output/
├── business-plan.json          # Business strategy and market analysis
├── product-spec.json           # Detailed product specification
├── design-system.json          # Complete design system
├── mockups/                    # Page mockups
├── architecture.json           # System architecture
├── api-contracts.yaml          # OpenAPI 3.0 specification
├── test-plan.json             # QA test plan
├── test-results.json          # Test execution results
├── qa-report.md               # QA findings
└── generated-project/         # Your complete application
    ├── app/                   # Next.js pages and API routes
    ├── components/            # React components
    ├── lib/                   # Utilities and services
    ├── prisma/                # Database schema
    ├── tests/                 # Test suite
    └── styles/                # Tailwind configuration
```

---

### Improving an Existing App (`/improve-app`)

The **6-Agent Improvement Workflow** analyzes and enhances existing applications:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   AUTONOMOUS APP IMPROVER v2.0                             ║
║                    6-Agent Improvement Workflow                            ║
╚════════════════════════════════════════════════════════════════════════════╝

PHASE 1: CODEBASE ANALYSIS (Analysis Agent)
        ↓
        🔔 CHECKPOINT 1: Analysis Report Review
        ↓
PHASE 2: IMPROVEMENT PLANNING (PM Agent - Adapted)
        ↓
        🔔 CHECKPOINT 2: Improvement Plan Approval
        ↓
PHASE 3: TECHNICAL REVIEW (Designer + Architect IN PARALLEL)
        ↓
        🔔 CHECKPOINT 3: Technical Review Approval
        ↓
PHASE 4: BACKEND IMPROVEMENTS (Backend Developer - Adapted)
        ↓
PHASE 5: FRONTEND IMPROVEMENTS (Frontend Developer - Adapted)
        ↓
        🔔 CHECKPOINT 4: Implementation Review
        ↓
PHASE 6: QUALITY ASSURANCE (QA Agent - Adapted)
        ↓
        🔔 CHECKPOINT 5: QA Approval
        ↓
COMPLETION (Before/After Metrics)
```

#### What Happens

1. **Phase 1**: Analysis Agent audits your codebase
   - Reviews code quality, architecture, design, performance, security
   - Identifies gaps, issues, and opportunities
   - You review and approve analysis report

2. **Phase 2**: PM Agent plans improvements
   - Analyzes UX gaps and missing features
   - Prioritizes improvements using RICE scoring
   - You review and approve improvement plan

3. **Phase 3**: Designer + Architect review in parallel
   - Designer reviews design consistency and UI/UX
   - Architect reviews architecture and performance
   - You review and approve technical improvements

4. **Phase 4**: Backend Developer implements improvements
   - Fixes bugs and security issues
   - Optimizes performance
   - Adds new API endpoints

5. **Phase 5**: Frontend Developer implements improvements
   - Enhances UI/UX
   - Adds new features
   - Fixes design inconsistencies

6. **Phase 6**: QA Agent tests improvements
   - Tests new features
   - Regression tests existing features
   - You review before/after metrics and approve

7. **Completion**: See improvement summary
   - Performance gains (e.g., "2.5s → 1.2s page load")
   - Test coverage increase (e.g., "45% → 85%")
   - Security issues fixed
   - Features added

#### Example Usage

```bash
# Improve performance and add features
/improve-app optimize performance and add user notifications

# Fix bugs and improve UX
/improve-app fix authentication bugs and improve onboarding flow

# Enhance existing features
/improve-app add search functionality and improve dashboard UX
```

#### Generated Artifacts (Improvement)

After completion, you'll have:

```
output/
├── analysis-report.json           # Comprehensive codebase audit
├── improvement-spec.json          # Detailed improvement plan
├── design-improvements.json       # Design enhancements
├── architecture-improvements.json # Architecture optimizations
├── api-contracts-updated.yaml     # Updated API contracts
├── test-plan-improvements.json    # Improvement test plan
├── qa-improvement-report.md       # Before/after QA report
└── generated-project/             # Your improved application
    ├── app/                       # Updated pages and API routes
    ├── components/                # Enhanced components
    ├── lib/                       # Improved utilities
    ├── prisma/                    # Optimized database schema
    ├── tests/                     # Expanded test suite
    └── styles/                    # Updated styles
```

---

### Workflow Comparison

| Aspect | `/build-app` | `/improve-app` |
|--------|-------------|----------------|
| **Purpose** | Create new app from scratch | Enhance existing app |
| **Starting Point** | User's idea | Existing codebase |
| **Agents Used** | 7 agents | 6 agents (Analysis replaces CEO) |
| **Phase 1** | CEO validates business | Analysis audits codebase |
| **Focus** | Building everything new | Surgical improvements |
| **Output** | Complete new application | Enhanced existing app |
| **Time** | 25-40 minutes | 15-30 minutes |
| **Use When** | Starting a new project | Adding features, fixing bugs, optimizing |

---

## Autonomous Execution

The workflow is **fully autonomous between checkpoints**. You don't need to:
- Manually run each agent
- Create intermediate files
- Configure anything during execution

The system will:
- Automatically spawn agents using the Task tool
- Pass outputs between agents
- Handle all file creation
- Present results at checkpoints

You only need to:
- **Approve or reject at the 5 checkpoints**
- **Answer clarification questions if needed**

---

## Shared Infrastructure

All generated projects use **shared infrastructure** configured once:

### Configured in `.env.shared`:
- **Supabase Database** - PostgreSQL connection
- **AWS S3** - File storage (auto-creates bucket per project)
- **AWS Region** - Deployment region
- **NextAuth Secret** - Authentication

### Per-Project Resources:
- **Database**: Separate schema in shared Supabase instance
- **S3 Bucket**: Auto-created bucket named `{project-name}-uploads`
- **Environment Variables**: Auto-configured in `.env`

### Setup Once:
```bash
npm run setup-infrastructure
```

Then every generated project automatically gets:
- Database connection
- S3 bucket
- NextAuth configuration
- AWS credentials

---

## E2E Testing with Playwright

All generated projects include **comprehensive E2E testing** using Playwright for browser automation.

### What Gets Tested

The QA Agent automatically generates and executes tests for:

1. **Authentication Flows**
   - User signup with validation
   - Login/logout functionality
   - Password reset flows
   - Protected route guards

2. **Critical User Journeys**
   - Complete workflows (e.g., checkout, booking, profile updates)
   - Form submissions with validation
   - Error handling and recovery
   - Success confirmations

3. **Accessibility (WCAG 2.1 AA)**
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast
   - ARIA attributes
   - Form labels

4. **Visual Regression**
   - Screenshot comparison
   - Layout verification
   - Responsive design

5. **API Integration**
   - Endpoint testing
   - Error responses
   - Authentication/authorization
   - Rate limiting

6. **Performance**
   - Page load times
   - API response times
   - Lighthouse audits

### Test ID Convention

The Frontend Developer adds `data-testid` attributes to all interactive elements:

```tsx
// Buttons
<button data-testid="login-button">Login</button>

// Inputs
<input data-testid="email-input" type="email" />

// Forms
<form data-testid="signup-form">...</form>

// Links
<a data-testid="dashboard-link" href="/dashboard">Dashboard</a>
```

This ensures tests are stable and don't break when CSS classes or text changes.

### Running Tests

```bash
# Run all E2E tests
cd output/generated-project
npx playwright test

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# View test report
npx playwright show-report
```

### Test Results

The QA Agent provides:
- **Pass/Fail Metrics:** "82/87 tests passed (94%)"
- **Screenshots:** Captures screenshots of any failures
- **Performance Metrics:** Actual load times and response times
- **Accessibility Violations:** Specific WCAG failures with recommendations
- **Security Findings:** Vulnerabilities detected during testing

Example QA Report excerpt:
```
## Test Execution Results

### E2E Tests (Playwright)
- ✅ Authentication flows: 12/12 passed
- ✅ User onboarding: 8/8 passed
- ❌ Payment processing: 2/3 passed (1 failure)

### Failed Tests
**Payment Processing - Card Declined Scenario**
- Status: ❌ Failed
- Location: tests/e2e/payment.spec.ts:45
- Error: Expected error message not shown when card is declined
- Screenshot: ./test-results/payment-error-1.png
- Recommendation: Add error handling for declined cards in PaymentForm component

### Performance Results
- Homepage load: 1.2s ✅ (target: < 3s)
- API response: 245ms ✅ (target: < 500ms)

### Accessibility
- ⚠️ 3 color contrast issues on secondary buttons
- ✅ All form inputs have labels
```

---

## Tips for Best Results

### 1. Be Specific in Your Idea
Instead of: "a social media app"
Better: "a fitness coaching platform where certified trainers can create personalized workout plans, track client progress, and communicate via video"

### 2. Review Checkpoints Carefully
Each checkpoint is a quality gate. Take time to:
- Read the business plan
- Review user personas
- Check design system
- Validate API contracts
- Test the implementation

### 3. Request Changes When Needed
If something doesn't match your vision:
- Reject at the checkpoint
- Explain what needs to change
- The agent will iterate

### 4. Trust the Agents
Each agent is specialized and does deep research:
- CEO analyzes real market data
- PM researches UX best practices
- Designer creates professional design systems
- Architect optimizes for scale
- QA ensures quality

---

## Architecture Decisions

### Why CEO First?
Validates business viability before investing in development. Prevents building products that won't succeed.

### Why Deep PM Research?
Understanding best UX practices and mapping every page/flow prevents rework and ensures user-friendly products.

### Why Parallel Designer + Architect?
They work on independent concerns (visual design vs system architecture) with the same input, so parallel execution saves time.

### Why Backend Before Frontend?
Frontend needs to integrate with real API endpoints. Backend-first prevents integration mismatches.

### Why Dedicated QA Agent?
Professional QA generates comprehensive test coverage that developers often skip. Ensures production readiness.

---

## File Structure

```
autonomous-dev-system/
├── agents/
│   ├── analysis-agent-prompt.md           # Codebase audit (for /improve-app)
│   ├── ceo-agent-prompt.md                # Phase 1 (for /build-app)
│   ├── pm-agent-prompt.md                 # Phase 2 (both workflows)
│   ├── designer-agent-prompt.md           # Phase 3a (both workflows, parallel)
│   ├── architect-agent-prompt.md          # Phase 3b (both workflows, parallel)
│   ├── backend-developer-prompt.md        # Phase 4 (both workflows)
│   ├── frontend-developer-prompt.md       # Phase 5 (both workflows)
│   └── qa-agent-prompt.md                 # Phase 6 (both workflows)
├── .claude/
│   └── commands/
│       ├── build-app.md                   # New app orchestrator (7 agents)
│       └── improve-app.md                 # Improvement orchestrator (6 agents)
├── scripts/
│   ├── setup-infrastructure.js            # One-time setup
│   └── create-project-db.js              # Per-project DB/S3
├── .env.shared                            # Shared credentials
├── shared-infrastructure.json             # Project registry
└── output/                                # All generated artifacts
```

---

## Troubleshooting

### Agent Asks Too Many Questions
The agents are designed to be autonomous. If an agent asks for clarification:
- It genuinely needs the information
- Answer the question
- The agent will continue autonomously

### Checkpoint Rejection
If you reject at a checkpoint:
- Explain what needs to change
- The system will re-run that phase
- All previous work is preserved

### Long Execution Time
The 7-agent workflow is comprehensive:
- CEO Agent: 2-3 minutes (market research)
- PM Agent: 3-5 minutes (UX research, detailed specs)
- Designer + Architect: 4-6 minutes (parallel)
- Backend Developer: 5-8 minutes
- Frontend Developer: 5-8 minutes
- QA Agent: 4-6 minutes

**Total: ~25-40 minutes for enterprise-grade app**

This is time well spent for production-ready code!

---

## Next Steps

1. **Run the Setup Wizard** (one time):
   ```bash
   npm run setup-infrastructure
   ```

2. **Choose Your Workflow**:

   **Option A - Build a New App:**
   ```bash
   /build-app your amazing app idea
   ```

   **Option B - Improve Existing App:**
   ```bash
   /improve-app add features or fix issues
   ```

3. **Review Each Checkpoint** and approve when ready

4. **Deploy Your Production-Ready App**:
   ```bash
   cd output/generated-project
   npm install
   cp .env.example .env
   npm run dev
   ```

---

## Contributing

To add a new agent or modify the workflow:

1. **Create Agent Prompt**: Add to `agents/` directory
2. **Update Orchestrator**: Modify `.claude/commands/build-app.md`
3. **Add Checkpoint**: Define what to show and when to approve
4. **Test Workflow**: Run with sample app idea

---

## License

This autonomous development system is part of the Claude Code ecosystem.

---

**Built with Claude Code - Autonomous AI Development**
