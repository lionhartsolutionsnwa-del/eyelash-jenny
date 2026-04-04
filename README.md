# Jenny Professional Eyelash 🦋

A modern appointment booking website for Jenny's eyelash extension studio.

**Live:** https://eyelashjenny.com  
**Admin:** https://eyelashjenny.com/admin

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel

## Features

- 📅 Online appointment booking with real-time availability
- 📱 Mobile-first responsive design (PWA installable)
- 🔐 Admin dashboard with calendar & client management
- 💬 SMS notifications via Twilio (optional)
- 📊 Analytics & booking management

## Getting Started

```bash
# Clone the repo
git clone https://github.com/lionhartsolutionsnwa-del/eyelash-jenny.git

# Install dependencies
npm install

# Copy env vars and fill in your Supabase keys
cp .env.local.example .env.local

# Run dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | Twilio phone number |

## Services

| Service | Price | Duration |
|---------|-------|----------|
| Classic Lashes | $119 | 2 hours |
| Hybrid Lashes | $149 | 2.5 hours |
| Lash Removal | $25 | 30 min |

Built with 💛 by [LionHart Solutions](https://lionhartsolutionsnwa-del.github.io)
