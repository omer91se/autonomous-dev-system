# Shared Infrastructure Setup Guide

This guide helps you set up infrastructure **once** that all generated projects will use.

## Why Shared Infrastructure?

Instead of creating separate AWS accounts, databases, and Stripe accounts for every project, you configure these services once and all generated apps automatically use them:

- **One PostgreSQL instance** - Each project gets its own database
- **One S3 bucket** - Files organized by project prefix
- **One Stripe account** - Separate products per project
- **One email service** - All projects send emails
- **Reusable OAuth apps** - Same Google/GitHub login

## Quick Start

### Option 1: Interactive Setup (Recommended)

Run the setup wizard:

```bash
cd ~/projects/autonomous-dev-system
node scripts/setup-infrastructure.js
```

This will guide you through configuring all services.

### Option 2: Manual Setup

Edit `.env.shared` directly:

```bash
cd ~/projects/autonomous-dev-system
cp .env.shared.template .env.shared
nano .env.shared  # or use your preferred editor
```

## Services to Configure

### 1. PostgreSQL Database (Required)

**Option A: Local (Easiest for development)**

```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or apt-get install postgresql  # Linux

# Start PostgreSQL
brew services start postgresql

# Create a user (if needed)
createuser -s postgres
```

Then in `.env.shared`:
```env
SHARED_DB_HOST=localhost
SHARED_DB_PORT=5432
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres
```

**Option B: Cloud Database (Production-ready)**

Choose one:
- **Supabase** (https://supabase.com) - Free tier: 500MB
- **Railway** (https://railway.app) - Free trial with $5 credit

Get your connection string and add to `.env.shared`:
```env
SHARED_DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 2. AWS S3 (Required for file uploads)

1. Create AWS account: https://aws.amazon.com
2. Create IAM user with S3 access
3. Create S3 bucket (e.g., "autonomous-dev-projects")
4. Get access keys

Add to `.env.shared`:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=autonomous-dev-projects
```

**Alternative: Cloudinary** (easier setup)
- Free tier: 25GB storage
- Sign up: https://cloudinary.com

### 3. Stripe (For payments)

1. Sign up: https://stripe.com
2. Get test API keys: Dashboard → Developers → API keys

Add to `.env.shared`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Note**: Use test mode for all development. Test card: `4242 4242 4242 4242`

### 4. Email Service

**Option A: SendGrid (Recommended)**
- Free tier: 100 emails/day
- Sign up: https://sendgrid.com
- Get API key

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_key
EMAIL_FROM=noreply@yourdomain.com
```

**Option B: Resend (Modern alternative)**
- Free tier: 100 emails/day
- Sign up: https://resend.com

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_key
EMAIL_FROM=noreply@yourdomain.com
```

**Option C: Gmail (Testing only)**
1. Enable 2FA on your Gmail account
2. Create App Password: Google Account → Security → 2-Step Verification → App passwords

```env
EMAIL_PROVIDER=smtp
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your-email@gmail.com
```

**Option D: Mailtrap (Testing - doesn't send real emails)**
- Sign up: https://mailtrap.io
- Good for development - captures emails without sending

```env
EMAIL_PROVIDER=mailtrap
EMAIL_SERVER_HOST=smtp.mailtrap.io
EMAIL_SERVER_PORT=2525
EMAIL_SERVER_USER=your_mailtrap_user
EMAIL_SERVER_PASSWORD=your_mailtrap_pass
```

### 5. Authentication Secret

Generate a secret:
```bash
openssl rand -base64 32
```

Add to `.env.shared`:
```env
NEXTAUTH_SECRET=your_generated_secret
```

### 6. OAuth (Optional)

**Google OAuth**
1. Go to: https://console.cloud.google.com
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
```

**GitHub OAuth**
1. Go to: https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `http://localhost:3000/api/auth/callback/github`

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## How It Works

When you generate a new project:

1. **Coding agent reads** `.env.shared` for credentials
2. **Creates new database** with project-specific name
   - Example: "Task Manager" → database name: `task_manager`
3. **Uses shared S3** with project prefix
   - Example: Files go to `s3://autonomous-dev-projects/task-manager/`
4. **Generates .env.example** pre-filled with shared credentials
5. **Registers project** in `shared-infrastructure.json`

## Project Registry

All projects are tracked in `shared-infrastructure.json`:

```json
{
  "projects": [
    {
      "name": "formfit-coach",
      "database": "formfit_coach",
      "s3Prefix": "formfit-coach/",
      "createdAt": "2026-03-14",
      "status": "active"
    },
    {
      "name": "task-manager",
      "database": "task_manager",
      "s3Prefix": "task-manager/",
      "createdAt": "2026-03-15",
      "status": "active"
    }
  ]
}
```

## Minimal Setup (To Get Started Fast)

If you want to start quickly, you only need:

1. **Local PostgreSQL** (free)
2. **Skip S3 initially** (can add later)
3. **Skip Stripe** (if no payments needed)
4. **Use Mailtrap for emails** (free, testing only)

Minimal `.env.shared`:
```env
# Database
SHARED_DB_HOST=localhost
SHARED_DB_PORT=5432
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres

# Auth
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Email (testing)
EMAIL_PROVIDER=mailtrap
EMAIL_SERVER_HOST=smtp.mailtrap.io
EMAIL_SERVER_PORT=2525
EMAIL_SERVER_USER=get_from_mailtrap
EMAIL_SERVER_PASSWORD=get_from_mailtrap
```

Then add AWS and Stripe when you need them.

## Verification

To verify your setup:

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# List your databases
psql -U postgres -l

# Check if .env.shared exists
cat ~/projects/autonomous-dev-system/.env.shared
```

## Security Notes

- **Never commit** `.env.shared` to git (already in `.gitignore`)
- Use **test keys** for Stripe during development
- Keep **production secrets** separate from development
- Rotate **API keys** regularly

## Troubleshooting

**"Cannot connect to PostgreSQL"**
```bash
# Check if running
brew services list | grep postgresql

# Start it
brew services start postgresql
```

**"AWS credentials invalid"**
- Verify keys in AWS IAM console
- Check bucket name is correct
- Ensure bucket region matches AWS_REGION

**"Stripe test mode not working"**
- Make sure you're using `sk_test_` keys (not `sk_live_`)
- Enable test mode in Stripe dashboard

**"Emails not sending"**
- Check provider credentials
- For Gmail: must use App Password (not regular password)
- For SendGrid: verify API key has "Mail Send" permission

## Next Steps

Once configured:

1. Generate your first app: `/build-app`
2. The agent will automatically:
   - Create a new database
   - Use your S3 bucket
   - Configure Stripe
   - Set up email
3. You just need to run:
   ```bash
   cd output/generated-project
   npm install
   npm run dev
   ```

## Cost Breakdown

Free tier options:
- PostgreSQL: Free (local) or $0-5/month (cloud)
- S3: ~$0.023 per GB (~$1/month for small projects)
- Stripe: Free (pay only on transactions)
- Email: Free up to 100/day (SendGrid/Resend)
- **Total**: ~$0-10/month for development

## Support

If you need help:
1. Check this guide
2. Review `.env.shared.template`
3. Run `node scripts/setup-infrastructure.js` for guided setup
