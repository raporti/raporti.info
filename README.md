# Raporti - Albanian AI News Platform

A modern Albanian news platform that monitors public Telegram channels, extracts factual information using AI, and generates completely original Albanian news articles.

## Architecture

```
Telegram Channel → Ingestion Service → AI Fact Extraction → AI Article Generation → Admin Review → Published Article
```

### Key Principles
- **Never copies** Telegram posts verbatim
- **Extracts facts only** (who, what, where, when, why)
- **Generates original** Albanian articles from extracted facts
- **Source attribution** always included with link back to original
- **Manual review** mode by default (auto-publish optional)

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS v4
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **AI**: OpenAI GPT-4o (for fact extraction + article generation)
- **Auth**: JWT-based admin authentication
- **Hosting**: Vercel (frontend) + Supabase (database)
- **Thumbnails**: Server-side canvas generation

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd raporti.info
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in the required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token (create via @BotFather) |
| `TELEGRAM_CHANNELS` | Comma-separated channel usernames to monitor |
| `OPENAI_API_KEY` | OpenAI API key for article generation |
| `ADMIN_JWT_SECRET` | Random secret for JWT tokens (min 32 chars) |
| `ADMIN_DEFAULT_EMAIL` | Default admin email |
| `ADMIN_DEFAULT_PASSWORD` | Default admin password |
| `CRON_SECRET` | Secret for cron endpoint authentication |
| `NEXT_PUBLIC_SITE_URL` | Your site URL |

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed default data (admin user, categories, settings)
npm run db:seed
```

### 4. Telegram Bot Setup

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Add the bot as an admin to the channels you want to monitor
3. Set the bot token in `.env`
4. The system also supports scraping public channels as a fallback

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login

### 6. Deploy to Vercel

```bash
npx vercel
```

The `vercel.json` configures a cron job to run every 3 minutes for automatic ingestion.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout with SEO
│   ├── globals.css               # Global styles
│   ├── sitemap.ts                # Dynamic sitemap
│   ├── robots.ts                 # Robots.txt
│   ├── news/[slug]/page.tsx      # Article page
│   ├── kategori/[slug]/page.tsx  # Category page
│   ├── kerko/page.tsx            # Search page
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── login/page.tsx        # Admin login
│   │   └── settings/page.tsx     # Admin settings
│   └── api/
│       ├── auth/                 # Auth endpoints
│       ├── articles/             # Article CRUD
│       ├── admin/                # Admin stats & settings
│       ├── cron/route.ts         # Cron job endpoint
│       ├── ingest/route.ts       # Manual ingestion trigger
│       └── thumbnail/            # Thumbnail generation
├── components/
│   ├── layout/                   # Header, Footer
│   ├── article/                  # ArticleCard, ShareButtons, ReadingProgress
│   └── admin/                    # Admin components
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # JWT authentication
│   ├── telegram.ts               # Telegram ingestion service
│   ├── ai-pipeline.ts            # AI fact extraction + article generation
│   ├── thumbnail.ts              # Thumbnail generation
│   └── utils.ts                  # Helpers, categories, formatting
└── types/
    └── index.ts                  # TypeScript types
```

## Publishing Modes

### Manual Review (Default)
```
Telegram Post → Ingest → AI Processes → Draft → Admin Reviews → Publish/Reject
```

### Auto-Publish
```
Telegram Post → Ingest → AI Processes → Auto-Published
```

Toggle in Admin > Settings.

## Image Modes

1. **Generated** (default, safest): AI-generated dark-themed thumbnails with title overlay
2. **Source Link**: Links to the original post, no image download
3. **Admin Approved**: Images require manual admin approval before display

## AI Pipeline

### Fact Extraction
Extracts structured facts from Telegram posts:
- Who, What, Where, When, Why
- Key claims and confidence level
- Category and urgency classification

### Article Generation
Generates completely original Albanian articles:
- Professional journalistic tone
- No copied phrases from source
- Different sentence structure
- SEO-optimized metadata
- Source attribution line included

## Admin Panel

Access at `/admin` with your configured credentials.

Features:
- View all ingested posts and generated articles
- Filter by status (draft/published/rejected)
- Edit headlines, body, summary
- Approve or reject articles
- Regenerate articles with AI
- Configure publishing mode and image mode
- Manual ingestion trigger

## Cron Job

The `/api/cron` endpoint runs automatically on Vercel every 3 minutes:
1. Fetches new posts from configured Telegram channels
2. Skips duplicates (by channel + message ID)
3. Runs AI fact extraction on new posts
4. Generates Albanian articles
5. Saves as draft (manual mode) or publishes (auto mode)

For local development, trigger manually:
```bash
curl http://localhost:3000/api/cron
```

## License

Private - All rights reserved.
