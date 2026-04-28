# 😭 Corper Confessions

Anonymous confessions from Nigerian corpers. Too real. Too painful. Too funny.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (Postgres database)
- **Vercel** (hosting + edge OG image generation)

---

## 🚀 Quick Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd corper-confessions
npm install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Open the **SQL Editor**
3. Paste and run the contents of `supabase-schema.sql`
4. Copy your **Project URL** and **anon public key** from Project Settings → API

### 3. Environment Variables
```bash
cp .env.local.example .env.local
```
Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://corperconfessions.ng
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add the same environment variables in your Vercel dashboard under **Settings → Environment Variables**.

---

## 📁 Project Structure

```
app/
  page.tsx                  # Home (SSR, fetches initial confessions)
  layout.tsx                # Root layout + metadata
  globals.css               # Global styles + animations
  api/
    confessions/route.ts    # GET (list) + POST (submit)
    reactions/route.ts      # POST (react to confession)
    og/route.tsx            # Dynamic OG image per confession
  confession/
    [id]/
      page.tsx              # Confession detail page (SSR metadata)
      ConfessionDetailClient.tsx

components/
  HomeClient.tsx            # Main feed client component
  ConfessionCard.tsx        # Single confession card
  SubmitModal.tsx           # Anonymous submission modal
  TagFilter.tsx             # Horizontal tag filter strip

lib/
  supabase.ts               # Supabase client + types
  seeds.ts                  # Seed confessions + tag config
  utils.ts                  # Helpers (formatNum, timeAgo, etc.)

supabase-schema.sql         # Run this in Supabase SQL Editor
```

---

## 🔥 Distribution Playbook

1. **Launch day**: Drop the link in 10 corper WhatsApp groups manually
2. **Trigger moment**: Post the link on Twitter/X the day call-up letters drop
3. **Viral mechanic**: Every share card includes the app URL - when someone shares a confession, new users click and submit their own
4. **OG cards**: Every confession URL generates a rich WhatsApp/Twitter preview automatically

---

## 🛡️ Moderation

- Set `is_approved = false` by default in `route.ts` for manual moderation
- Or build an admin page at `/admin` behind Supabase auth
- The `service_role` key (never expose client-side) can update/delete rows

---

## 📊 Analytics (Optional)
Add [Vercel Analytics](https://vercel.com/analytics) to `layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'
// Add <Analytics /> to your layout
```
