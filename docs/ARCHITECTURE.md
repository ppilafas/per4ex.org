# Supercore Architecture

## Overview

Personal portfolio and AI-powered assistant for [supercore.tech](https://supercore.tech).  
Single Next.js 16 application deployed to Vercel.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **AI**: Vercel AI SDK 6 + Google Gemini 2.0 Flash
- **Styling**: Tailwind CSS 4
- **Email**: Resend (contact form via chat widget)
- **Deployment**: Vercel (auto-deploy from GitHub)

## Directory Structure

```
supercore.tech/
├── apps/web/              # Next.js application
│   ├── app/               # App Router pages & API routes
│   │   ├── api/chat/      # Gemini chat endpoint (SSE streaming)
│   │   ├── api/github/    # GitHub repos proxy (migrated from Python)
│   │   ├── api/admin/     # Admin settings, chat log, auth
│   │   └── ...            # Page routes
│   ├── components/        # React components
│   │   ├── assistant-widget.tsx  # Chat widget (Gemini, SSE, terminal logs)
│   │   ├── admin-ai-settings.tsx # Admin AI config panel
│   │   └── admin-chat-log.tsx    # Admin interaction log viewer
│   ├── lib/               # Server utilities
│   │   ├── ai-config.ts   # AI model settings (persisted to .data/)
│   │   ├── chat-log.ts    # Chat interaction logger
│   │   ├── knowledge-base.ts    # Static knowledge context
│   │   └── system-instructions.ts # System prompt management
│   └── public/            # Static assets
├── docs/                  # Project documentation
├── vercel.json            # Deployment config (rootDirectory: apps/web)
├── bootstrap.sh           # Local dev launcher
└── .env.local             # Environment variables (not committed)
```

## Key API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Gemini chat with SSE streaming, contact email tool |
| `/api/github/repos` | GET | GitHub repos with in-memory cache (1h TTL) |
| `/api/admin/ai-settings` | GET/POST | Read/update AI model settings |
| `/api/admin/chat-log` | GET/DELETE | View/clear widget interaction logs |
| `/api/admin/system-instructions` | GET/POST | Read/update system prompt |
| `/api/ai/settings` | GET | Public AI settings (model name) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini API key |
| `RESEND_API_KEY` | No | Resend email API key |
| `OWNER_EMAIL` | No | Email recipient for contact form |
| `ADMIN_USERNAME` | No | Admin panel username |
| `ADMIN_PASSWORD` | No | Admin panel password |
| `ADMIN_SESSION_SECRET` | No | Session signing secret |

## Deployment

Vercel auto-deploys from the `main` branch. The `vercel.json` at root sets:
- `rootDirectory: "apps/web"` — Vercel builds from the Next.js app
- `framework: "nextjs"` — Uses the Next.js builder

**Important**: Do not create nested `.vercel/project.json` files in subdirectories.
The root `.vercel/project.json` is the only one that should exist.

## Local Development

```bash
./bootstrap.sh
# or
cd apps/web && npm run dev
```
