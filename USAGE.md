# How to Use the Autonomous Dev System

## The Simplest Way (Recommended)

Just type a slash command with your app idea:

```
/build-app A simple todo list with priorities and due dates
```

That's it! The system will:
1. ✅ Autonomously analyze your idea
2. ✅ Generate comprehensive requirements
3. ✅ Ask for your approval
4. ✅ Build the complete application
5. ✅ Present the finished app

## What Happens Automatically

When you use `/build-app`, Claude Code will:

### Phase 1: Requirements (Automatic)
- Spawn requirements agent
- Analyze your app idea
- Ask clarifying questions if needed
- Generate detailed specifications
- **STOP**: Present requirements for approval

### Phase 2: Development (Automatic after approval)
- Spawn coding agent
- Generate complete application code
- Set up database, auth, UI, and all features
- Create documentation
- **STOP**: Present implementation for approval

### Phase 3: Done!
- Show you where your app is
- Provide setup instructions

## Example Session

```
You: /build-app A recipe sharing platform

Claude:
╔════════════════════════════════════════════════════════════════════════════╗
║                        AUTONOMOUS APP BUILDER                              ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 App Idea: A recipe sharing platform

═══════════════════════════════════════════════════════════════════════════
⏳ PHASE 1: REQUIREMENTS ANALYSIS
═══════════════════════════════════════════════════════════════════════════

[Spawning requirements agent...]
[Analyzing your idea...]

✅ Requirements Generated!

════════════════════════════════════════════════════════════════════════════
🔔 CHECKPOINT: Requirements Review
════════════════════════════════════════════════════════════════════════════

Project: RecipeShare
Description: A social platform for sharing and discovering recipes...

Features:
- User authentication
- Recipe creation with photos
- Search and filtering
- Favorites and collections
- Comments and ratings
- ...

Tech Stack: Next.js + PostgreSQL

Your choice: [Approve/Reject]

You: Approve

═══════════════════════════════════════════════════════════════════════════
⏳ PHASE 2: DEVELOPMENT
═══════════════════════════════════════════════════════════════════════════

[Spawning coding agent...]
[Generating application structure...]
[Creating authentication system...]
[Building recipe features...]
[Setting up database...]

✅ Application Generated!

════════════════════════════════════════════════════════════════════════════
🔔 CHECKPOINT: Implementation Review
════════════════════════════════════════════════════════════════════════════

Files Created: 47 files
Features Implemented:
✓ User registration and login
✓ Recipe CRUD operations
✓ Image upload
✓ Search and filtering
✓ Comments and ratings
✓ Responsive design

Your choice: [Approve/Reject]

You: Approve

╔════════════════════════════════════════════════════════════════════════════╗
║                            🎉 BUILD COMPLETE!                              ║
╚════════════════════════════════════════════════════════════════════════════╝

Your app: ~/projects/autonomous-dev-system/output/generated-project/

Setup:
  cd ~/projects/autonomous-dev-system/output/generated-project
  npm install
  cp .env.example .env
  # Edit .env with your database URL
  npx prisma migrate dev
  npm run dev

Open: http://localhost:3000
```

## Other Ways to Use It

### Method 2: Longer Description

If your idea needs more detail:

```
/build-app I want to build a team collaboration tool with real-time chat,
task management, file sharing, and video calls. It should support teams
of up to 50 people.
```

### Method 3: Interactive (if you prefer more control)

1. Navigate to the directory:
   ```bash
   cd ~/projects/autonomous-dev-system
   ```

2. Run orchestrator manually:
   ```bash
   tsx orchestrate.ts "Your app idea here"
   ```

3. When prompted, tell Claude Code to spawn agents

## Tips for Best Results

### Good App Ideas (Specific)
✅ "A todo list with priorities, due dates, and tags"
✅ "A recipe platform with search, ratings, and meal planning"
✅ "A habit tracker with daily goals and streak tracking"

### Less Ideal (Too Vague)
❌ "A social media app"
❌ "An e-commerce site"
❌ "A productivity tool"

**Why?** More specific ideas get better results. The system will ask clarifying questions if needed, but starting specific helps!

## What You'll Get

### Generated Application Structure

```
output/generated-project/
├── app/                 # Next.js App Router
│   ├── api/            # Backend API routes
│   ├── (auth)/         # Auth pages
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── features/      # Feature-specific components
├── lib/               # Utilities and helpers
│   ├── auth.ts        # Authentication logic
│   ├── db.ts          # Database connection
│   └── utils.ts       # Helper functions
├── prisma/            # Database schema
│   └── schema.prisma  # Prisma schema file
├── public/            # Static assets
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── .env.example       # Environment variables template
└── README.md          # Setup instructions
```

### What's Included

Every generated app has:
- ✅ **Complete authentication** (register, login, logout)
- ✅ **Database setup** (Prisma with PostgreSQL)
- ✅ **All features** from your requirements
- ✅ **Responsive design** (mobile-friendly)
- ✅ **Type-safe** (TypeScript throughout)
- ✅ **Best practices** (error handling, validation)
- ✅ **Documentation** (setup and usage instructions)

## After Generation

### 1. Navigate to Your App
```bash
cd ~/projects/autonomous-dev-system/output/generated-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

### 4. Set Up Database
```bash
npx prisma migrate dev
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Open in Browser
```
http://localhost:3000
```

## Checkpoints

The system will pause for your approval at these points:

### Checkpoint 1: Requirements
**You see:** Complete technical specifications
**You decide:**
- **Approve** → Continue to development
- **Reject** → Provide feedback for revision

### Checkpoint 2: Implementation
**You see:** Implementation summary and file list
**You decide:**
- **Approve** → Build complete!
- **Reject** → Request changes

## Troubleshooting

### "No such command: /build-app"
**Solution:** Make sure you're in a Claude Code session and the `.claude/commands/` directory exists in the project.

### Agent doesn't complete
**Solution:** Check the `output/` directory for partial results. You can resume from checkpoints.

### Want to start over
**Solution:** Clean the output directory:
```bash
cd ~/projects/autonomous-dev-system
npm run clean
```

### Generated app won't run
**Solution:** Check:
1. Did you run `npm install`?
2. Did you set up `.env`?
3. Did you run database migrations?
4. Is the database running?

## Advanced Usage

### Build Multiple Apps
Clean output between projects:
```bash
npm run clean
/build-app [new idea]
```

### Customize Generated Code
The generated code is yours! Modify it however you want:
- Add new features
- Change the styling
- Integrate more services
- Deploy to production

### Save Your Projects
Move generated projects to a permanent location:
```bash
mv output/generated-project ~/projects/my-awesome-app
```

## Next Steps

After your first successful build:

1. **Explore the code** - See how everything works
2. **Customize it** - Make it truly yours
3. **Deploy it** - Share with the world
4. **Build more** - Try more complex ideas

## Examples to Try

Start with these:

### Simple
```
/build-app A simple note-taking app with markdown support
```

### Medium
```
/build-app A task management app with teams, projects, and due dates
```

### Complex
```
/build-app A recipe platform with search, meal planning, shopping lists, and social features
```

## Need Help?

- Check `README.md` for detailed documentation
- Check `QUICKSTART.md` for a quick overview
- Check `WHATS_CHANGED.md` to understand the architecture

---

Happy building! 🚀

Just type: `/build-app [your idea]` and watch the magic happen!
