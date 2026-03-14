# FormFit Coach

A virtual coaching platform connecting fitness enthusiasts with certified trainers through video-based form analysis. Users submit workout videos and receive personalized feedback on technique, form corrections, and injury prevention guidance.

## Features

### Phase 1 (MVP)
- User and trainer registration with email authentication
- Basic profile creation for both roles
- Video upload functionality (up to 500MB)
- Simple video playback
- Text-based feedback system
- Basic trainer selection
- Single payment option (pay-per-review)
- Email notifications for key events

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3
- **Payments**: Stripe
- **Email**: NodeMailer (SendGrid compatible)
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- AWS S3 bucket
- Stripe account
- Email service (SendGrid, Mailgun, or SMTP)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:
- Database connection string
- NextAuth secret (generate with `openssl rand -base64 32`)
- AWS credentials and S3 bucket name
- Stripe API keys
- Email service credentials

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
formfit-coach/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── register/             # User registration
│   │   ├── videos/               # Video management
│   │   ├── feedback/             # Feedback system
│   │   ├── comments/             # Comments on feedback
│   │   ├── trainers/             # Trainer management
│   │   ├── payments/             # Payment processing
│   │   └── webhooks/             # Stripe webhooks
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # User dashboard
│   ├── trainer/                  # Trainer-specific pages
│   ├── trainers/                 # Trainer directory
│   ├── upload/                   # Video upload
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Navbar.tsx
│   ├── Providers.tsx
│   └── VideoUpload.tsx
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth configuration
│   ├── s3.ts                     # S3 file handling
│   ├── stripe.ts                 # Stripe integration
│   ├── email.ts                  # Email service
│   └── validations.ts            # Zod schemas
├── prisma/
│   └── schema.prisma             # Database schema
├── types/
│   └── next-auth.d.ts            # TypeScript definitions
└── package.json
```

## Database Schema

The application uses the following main models:

- **User**: Core user data with role (USER, TRAINER, ADMIN)
- **Trainer**: Extended trainer profile with certifications and specialties
- **Video**: Uploaded workout videos with metadata
- **Feedback**: Trainer feedback on videos
- **Comment**: Follow-up discussions on feedback
- **Transaction**: Payment records
- **Credit**: User credit balance

## API Routes

### Authentication
- `POST /api/register` - User registration
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Videos
- `GET /api/videos` - List user's videos
- `POST /api/videos` - Create video record
- `POST /api/videos/upload` - Get presigned upload URL

### Feedback
- `GET /api/feedback` - Get feedback for video
- `POST /api/feedback` - Create/submit feedback

### Trainers
- `GET /api/trainers` - List available trainers
- `PUT /api/trainers` - Update trainer profile

### Payments
- `POST /api/payments` - Create checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `NEXTAUTH_URL`: Application URL
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`: S3 credentials
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`: Stripe keys
- Email service credentials

## Deployment

### Recommended Setup
- **Application**: Vercel
- **Database**: Railway or Supabase (PostgreSQL)
- **File Storage**: AWS S3 or Cloudinary
- **Email**: SendGrid or AWS SES

### Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Migration
```bash
npx prisma migrate deploy
```

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Input validation with Zod
- SQL injection prevention (Prisma)
- CSRF protection
- Secure file uploads with presigned URLs
- Role-based access control
- Environment-based secrets

## Payment Flow

1. User selects credit package
2. Stripe Checkout session created
3. User completes payment
4. Webhook updates database
5. Credits added to user account

## Email Notifications

- Welcome email on registration
- New review request to trainers
- Feedback ready notification to users

## Future Enhancements (Phase 2+)

- Advanced video controls (slow-motion, frame-by-frame)
- Timestamped comments
- Trainer rating and review system
- Subscription tiers
- Admin panel
- Mobile apps
- AI-powered form analysis

## Contributing

This is a generated MVP. To extend:
1. Review the codebase
2. Add new features incrementally
3. Test thoroughly
4. Update documentation

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.
