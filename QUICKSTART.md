# Quick Start Guide

## The Simplest Way to Build an App

Just tell Claude Code:

```
Use the autonomous dev system to build my app.
My idea: [describe your app]
```

That's it! Claude Code will handle everything.

## Example

```
User: Use the autonomous dev system at ~/projects/autonomous-dev-system to build my app.
      My idea: A simple todo list app with priorities and due dates
```

Claude Code will:
1. ✅ Run the orchestrator
2. ✅ Spawn requirements agent to analyze your idea
3. ✅ Present requirements for your approval
4. ✅ Spawn coding agent to build the app
5. ✅ Present the complete application
6. ✅ Provide setup instructions

## What You Get

A complete, production-ready application in `output/generated-project/`:

```
output/generated-project/
├── app/                 # Your Next.js application
├── components/         # React components
├── prisma/             # Database schema
├── package.json
└── README.md          # Setup instructions
```

## Next Steps After Generation

1. **Navigate to your app:**
   ```bash
   cd ~/projects/autonomous-dev-system/output/generated-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your database URL
   ```

4. **Initialize database:**
   ```bash
   npx prisma migrate dev
   ```

5. **Run your app:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Tips

- **Be specific** in your app description
- **Approve thoughtfully** at checkpoints
- **Test thoroughly** before deploying
- **Customize** the generated code to make it yours

## Need More Control?

See [README.md](README.md) for advanced usage and manual orchestration.

## Example App Ideas

Try these:
- "A simple todo list with priorities"
- "A note-taking app with markdown support"
- "A recipe sharing platform"
- "A personal finance tracker"
- "A team task management tool"
- "A blog with comments"
- "A URL shortener"

## Troubleshooting

**Issue**: Agent doesn't start
**Solution**: Make sure you're in the project directory:
```bash
cd ~/projects/autonomous-dev-system
```

**Issue**: Output directory not found
**Solution**: The orchestrator creates it automatically, but you can create manually:
```bash
mkdir -p output
```

**Issue**: Want to start fresh
**Solution**: Clean the output directory:
```bash
npm run clean
```

## What's Next?

After building your first app:
1. Try a more complex idea
2. Customize the generated code
3. Deploy to Vercel or another host
4. Share your creation!

Happy building! 🚀
