# API Documentation

## Authentication

All authenticated endpoints require a valid session cookie from NextAuth.

### POST /api/register
Register a new user or trainer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "USER" // or "TRAINER"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "cuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Validation:**
- Name: minimum 2 characters
- Email: valid email format
- Password: minimum 8 characters
- Role: must be "USER" or "TRAINER"

---

## Videos

### GET /api/videos
Get videos for the authenticated user.

**Query Parameters:**
- `userId` - Filter by user ID (user can only see their own)

**Response (200):**
```json
{
  "videos": [
    {
      "id": "video_id",
      "title": "Deadlift Form Check",
      "description": "Looking for feedback on my form",
      "fileUrl": "https://s3.amazonaws.com/...",
      "thumbnailUrl": null,
      "workoutType": "Weightlifting",
      "duration": null,
      "fileSize": 52428800,
      "status": "READY",
      "createdAt": "2024-01-15T10:00:00Z",
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "feedback": []
    }
  ]
}
```

### POST /api/videos
Create a new video record (after upload to S3).

**Request Body:**
```json
{
  "title": "Deadlift Form Check",
  "description": "Looking for feedback on my form",
  "workoutType": "Weightlifting",
  "fileUrl": "https://s3.amazonaws.com/...",
  "fileSize": 52428800
}
```

**Response (201):**
```json
{
  "video": {
    "id": "video_id",
    "title": "Deadlift Form Check",
    "status": "READY",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Validation:**
- Title: minimum 3 characters
- Workout type: required
- File size: maximum 500MB (524288000 bytes)

### POST /api/videos/upload
Get a presigned URL for uploading a video to S3.

**Request Body:**
```json
{
  "fileName": "workout_video.mp4",
  "contentType": "video/mp4"
}
```

**Response (200):**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/presigned-url",
  "key": "videos/user_id/timestamp-filename.mp4",
  "fileUrl": "https://s3.amazonaws.com/videos/user_id/timestamp-filename.mp4"
}
```

**Allowed Content Types:**
- video/mp4
- video/quicktime
- video/x-msvideo

---

## Feedback

### GET /api/feedback
Get feedback for a video or trainer.

**Query Parameters:**
- `videoId` - Get feedback for specific video
- `trainerId` - Get all feedback for trainer (trainer only)

**Response (200):**
```json
{
  "feedback": [
    {
      "id": "feedback_id",
      "videoId": "video_id",
      "trainerId": "trainer_id",
      "content": "Your form looks good overall...",
      "rating": null,
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:00:00Z",
      "trainer": {
        "id": "trainer_id",
        "name": "Jane Coach",
        "role": "TRAINER"
      },
      "video": {
        "id": "video_id",
        "title": "Deadlift Form Check",
        "userId": "user_id"
      },
      "comments": []
    }
  ]
}
```

### POST /api/feedback
Create a feedback request (user) or submit feedback (trainer).

**Request Body (User - Request Feedback):**
```json
{
  "videoId": "video_id",
  "trainerId": "trainer_id"
}
```

**Request Body (Trainer - Submit Feedback):**
```json
{
  "videoId": "video_id",
  "content": "Your form looks good overall. Here are some suggestions...",
  "rating": 5
}
```

**Response (201):**
```json
{
  "feedback": {
    "id": "feedback_id",
    "videoId": "video_id",
    "trainerId": "trainer_id",
    "status": "PENDING"
  }
}
```

**Validation:**
- Content: minimum 50 characters (for trainer submission)
- Rating: 1-5 (optional)

---

## Comments

### POST /api/comments
Add a follow-up comment to feedback.

**Request Body:**
```json
{
  "feedbackId": "feedback_id",
  "content": "Thanks for the feedback! Can you clarify...",
  "timestamp": 45 // Optional: video timestamp in seconds
}
```

**Response (201):**
```json
{
  "comment": {
    "id": "comment_id",
    "feedbackId": "feedback_id",
    "userId": "user_id",
    "content": "Thanks for the feedback!",
    "timestamp": 45,
    "createdAt": "2024-01-15T10:00:00Z",
    "user": {
      "id": "user_id",
      "name": "John Doe"
    }
  }
}
```

---

## Trainers

### GET /api/trainers
Get list of available trainers.

**Query Parameters:**
- `specialty` - Filter by specialty
- `isActive` - Filter by active status (true/false)

**Response (200):**
```json
{
  "trainers": [
    {
      "id": "trainer_id",
      "userId": "user_id",
      "bio": "Certified personal trainer with 10 years experience...",
      "specialties": ["Weightlifting", "CrossFit"],
      "certifications": ["NASM-CPT", "CrossFit Level 1"],
      "rating": 4.8,
      "totalReviews": 156,
      "isVerified": true,
      "isActive": true,
      "hourlyRate": 75.00,
      "user": {
        "id": "user_id",
        "name": "Jane Coach",
        "email": "jane@example.com",
        "image": null
      }
    }
  ]
}
```

### PUT /api/trainers
Update trainer profile (trainer only).

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "specialties": ["Weightlifting", "CrossFit", "Olympic Lifting"],
  "hourlyRate": 85.00
}
```

**Response (200):**
```json
{
  "trainer": {
    "id": "trainer_id",
    "bio": "Updated bio...",
    "specialties": ["Weightlifting", "CrossFit", "Olympic Lifting"],
    "hourlyRate": 85.00
  }
}
```

**Validation:**
- Bio: minimum 50 characters
- Specialties: at least 1 required
- Hourly rate: must be positive

---

## Payments

### POST /api/payments
Create a Stripe Checkout session for purchasing credits.

**Request Body:**
```json
{
  "credits": 5,
  "amount": 124.99
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Validation:**
- Credits: minimum 1
- Amount: must be positive

### POST /api/webhooks/stripe
Handle Stripe webhook events (internal use only).

**Events Handled:**
- `checkout.session.completed` - Credit purchase completed
- `payment_intent.payment_failed` - Payment failed

This endpoint verifies the webhook signature and updates the database accordingly.

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently not implemented in Phase 1. Recommended for production:
- API routes: 100 requests per 15 minutes per IP
- Upload endpoints: 10 uploads per hour per user
- Payment endpoints: 5 requests per minute per user

---

## Webhooks

### Stripe Webhook
**Endpoint:** `/api/webhooks/stripe`

**Setup:**
1. Add webhook endpoint in Stripe Dashboard
2. Set `STRIPE_WEBHOOK_SECRET` environment variable
3. Subscribe to events: `checkout.session.completed`, `payment_intent.payment_failed`

**Payload:** Stripe automatically sends webhook payload with signature in headers.

---

## Authentication Flow

1. User registers via `/api/register`
2. User signs in via NextAuth (`/api/auth/signin`)
3. NextAuth creates a session and sets a cookie
4. All subsequent requests include the session cookie
5. Protected routes verify the session via middleware
6. API routes verify session via `getServerSession()`

---

## File Upload Flow

1. Client requests presigned URL via `/api/videos/upload`
2. Client uploads file directly to S3 using presigned URL
3. Client creates video record via `/api/videos` with S3 URL
4. Server validates and stores video metadata

---

## Payment Flow

1. User selects credit package
2. Client calls `/api/payments` to create checkout session
3. User redirected to Stripe Checkout
4. User completes payment
5. Stripe webhook calls `/api/webhooks/stripe`
6. Server updates credit balance
7. User redirected back to dashboard

---

## Credit System

- Users start with 0 credits
- Each feedback request costs 1 credit
- Credits are deducted when feedback is requested
- Credits never expire
- Refunds add credits back (not implemented in Phase 1)

---

## Feedback Workflow

1. User uploads video
2. User selects trainer and requests feedback (1 credit deducted)
3. Trainer receives email notification
4. Trainer reviews video and submits feedback
5. User receives email notification
6. User views feedback and can ask follow-up questions
7. Trainer can respond to comments (future enhancement)
