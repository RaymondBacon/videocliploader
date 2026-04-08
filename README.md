# Clipload — Video Downloader

A clean Next.js video downloader powered by the cobalt.tools open API.

## Deploy to Vercel (step-by-step)

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
cd clipload
vercel
```
Follow the prompts. That's it — Vercel auto-detects Next.js.

### Option B — GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. **Framework Preset**: Next.js (auto-detected)
5. Leave all other settings as defaults
6. Click **Deploy**

> No environment variables needed. No special config.
> The `vercel.json` in this project handles everything.

## Run locally
```bash
npm install
npm run dev
# visit http://localhost:3000
```

## How it works
- Frontend: Next.js App Router (`app/page.js`)
- Backend: Edge API route (`app/api/download/route.js`)
  - Proxies requests to cobalt.tools to avoid CORS issues
  - Tries multiple cobalt instances for reliability
- Supports: YouTube, TikTok, Instagram, Twitter/X, Reddit, Vimeo, Twitch Clips, SoundCloud, and 30+ more

## Project structure
```
clipload/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.js   ← backend proxy (Edge Runtime)
│   ├── layout.js
│   ├── page.js            ← main UI
│   ├── page.module.css
│   └── globals.css
├── next.config.js
├── vercel.json            ← tells Vercel this is a Next.js app
├── package.json
└── README.md
```
