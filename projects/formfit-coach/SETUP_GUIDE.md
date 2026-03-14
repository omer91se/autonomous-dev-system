# FormFit Coach - Setup Guide

This guide will walk you through setting up FormFit Coach locally and deploying to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [AWS S3 Setup](#aws-s3-setup)
5. [Stripe Setup](#stripe-setup)
6. [Email Service Setup](#email-service-setup)
7. [Running the Application](#running-the-application)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm or yarn package manager
- A PostgreSQL database (local or cloud)
- AWS account (for S3 storage)
- Stripe account (for payments)
- Email service account (SendGrid, Mailgun, or SMTP)

---

## Local Development Setup

### 1. Install Dependencies

```bash
cd output/generated-project
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and fill in the following values (detailed instructions below):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/formfit_coach"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="formfit-videos"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@formfitcoach.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in your `.env` file.

---

## Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
```sql
CREATE DATABASE formfit_coach;
```
3. Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/formfit_coach"
```

### Option B: Railway (Recommended for Cloud)

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string
5. Update `DATABASE_URL` in `.env`

### Option C: Supabase

1. Go to [Supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use "Connection pooling" for production)
5. Update `DATABASE_URL` in `.env`

### Initialize Database

Run Prisma migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

You should see output confirming the migration was successful.

---

## AWS S3 Setup

### 1. Create S3 Bucket

1. Log into AWS Console
2. Go to S3 service
3. Click "Create bucket"
4. Enter bucket name (e.g., `formfit-videos-prod`)
5. Choose region (e.g., `us-east-1`)
6. **Important**: Block all public access (we'll use presigned URLs)
7. Create bucket

### 2. Configure CORS

1. Click on your bucket
2. Go to "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

### 3. Create IAM User

1. Go to IAM service
2. Click "Users" > "Add users"
3. Enter username (e.g., `formfit-s3-user`)
4. Select "Access key - Programmatic access"
5. Attach policy: `AmazonS3FullAccess` (or create custom policy)
6. Complete creation
7. **Save the Access Key ID and Secret Access Key**

### 4. Update .env

```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="formfit-videos-prod"
```

---

## Stripe Setup

### 1. Create Stripe Account

1. Go to [Stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete account verification

### 2. Get API Keys

1. Go to Developers > API keys
2. Copy "Publishable key" and "Secret key" (test mode)
3. Update `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Set Up Webhook (for production)

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Update `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**For local testing**, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Email Service Setup

### Option A: SendGrid (Recommended)

1. Go to [SendGrid.com](https://sendgrid.com)
2. Create account and verify email
3. Go to Settings > API Keys
4. Create an API key with "Mail Send" permissions
5. Update `.env`:

```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Option B: Gmail SMTP (Development Only)

1. Enable 2-factor authentication on your Google account
2. Generate an app password
3. Update `.env`:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### Option C: AWS SES

1. Go to AWS SES
2. Verify your domain or email
3. Create SMTP credentials
4. Update `.env` with SES SMTP settings

---

## Running the Application

### 1. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Create Test Accounts

1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Create a user account
4. Create a trainer account (use different email)

### 3. Test Video Upload

1. Sign in as user
2. Click "Upload Video"
3. Select a test video file (MP4, MOV, or AVI)
4. Fill in video details
5. Submit

### 4. Test Credit Purchase

1. Use Stripe test card: `4242 4242 4242 4242`
2. Use any future expiry date
3. Use any 3-digit CVC
4. Complete purchase

### 5. Test Feedback Flow

1. As user, request feedback from a trainer
2. Sign out and sign in as trainer
3. Review the video and submit feedback
4. Sign back in as user to view feedback

---

## Production Deployment

### Recommended Stack
- **Application**: Vercel
- **Database**: Railway or Supabase
- **Storage**: AWS S3
- **Email**: SendGrid

### Deploy to Vercel

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/formfit-coach.git
git push -u origin main
```

2. Go to [Vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure project:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. Add environment variables (all from `.env`)
7. Deploy

### Post-Deployment Steps

1. Update environment variables:
   - Set `NEXTAUTH_URL` to your Vercel URL
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
   - Update S3 CORS with your production URL

2. Run database migration:
```bash
npx prisma migrate deploy
```

3. Configure Stripe webhook:
   - Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Update `STRIPE_WEBHOOK_SECRET`

4. Test the production deployment

---

## Troubleshooting

### Database Connection Issues

**Error**: "Can't reach database server"
- Check `DATABASE_URL` is correct
- Ensure database is running
- Check firewall/network settings

**Solution**: Test connection with Prisma Studio:
```bash
npx prisma studio
```

### S3 Upload Failures

**Error**: "Access Denied"
- Check IAM user has S3 permissions
- Verify bucket name is correct
- Check CORS configuration

**Solution**: Test with AWS CLI:
```bash
aws s3 ls s3://your-bucket-name
```

### Stripe Webhook Not Working

**Error**: Webhook signature verification failed
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure endpoint URL is accessible

**Solution**: Test with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Email Not Sending

**Error**: Authentication failed
- Check email credentials
- Verify SMTP settings
- Check port is not blocked

**Solution**: Test SMTP connection separately

### Build Errors

**Error**: Module not found
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**Error**: Prisma client not generated
```bash
npx prisma generate
```

### NextAuth Session Issues

**Error**: Session not persisting
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Check `NEXTAUTH_URL` matches your domain

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3)

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the Next.js and Prisma logs
4. Contact the development team

---

## Security Checklist for Production

- [ ] All environment variables set correctly
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] Database has SSL enabled
- [ ] S3 bucket has public access blocked
- [ ] Stripe is in live mode (not test mode)
- [ ] CORS configured with production domain only
- [ ] Email sender domain is verified
- [ ] HTTPS is enforced
- [ ] Rate limiting implemented (future)
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Stripe webhooks verified

---

Happy coding! 🚀
