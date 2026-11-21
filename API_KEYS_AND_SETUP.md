# CampusFinder — API Keys & Setup Guide

> Complete step-by-step guide to configure, deploy and run CampusFinder.

---

## 1. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Mandatory | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Mandatory | Supabase anon/public key |
| `SUPABASE_SECRET_KEY` | ⚠️ Optional | Supabase service role key (privileged ops only) |

**Example `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Never commit `.env.local` to GitHub. It is already in `.gitignore`.

---

## 2. Obtaining Supabase Credentials

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Enter a project name (e.g., `campusfinder`).
4. Choose a region closest to your users.
5. Set a strong database password.
6. Click **Create new project** and wait ~2 minutes.

### Step 2: Get API Keys
1. In your project dashboard, click **Project Settings** (gear icon, bottom left).
2. Click **API** in the sidebar.
3. Under **Project URL**, copy the URL → `NEXT_PUBLIC_SUPABASE_URL`
4. Under **Project API Keys**, copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. The **service_role** key is `SUPABASE_SECRET_KEY` — keep this secret, never expose in browser.

---

## 3. Configure Supabase Authentication

1. In your Supabase dashboard, click **Authentication** → **Providers**.
2. Ensure **Email** provider is enabled.
3. Go to **Authentication** → **Email Templates** to customize verification emails (optional).
4. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (development) or your Vercel URL (production)
   - **Redirect URLs**: Add `https://your-vercel-app.vercel.app/**` for production

---

## 4. Run Database Migrations

1. In Supabase dashboard, click **SQL Editor** (left sidebar).
2. Click **New Query**.
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project.
4. Copy the entire contents and paste into the SQL Editor.
5. Click **Run** (or Ctrl+Enter).
6. Verify success — you should see all tables in **Table Editor**.

---

## 5. Create Storage Bucket

1. In Supabase dashboard, click **Storage** (left sidebar).
2. Click **New bucket**.
3. Name it exactly: `item-images`
4. Check **Public bucket** ✅
5. Click **Create bucket**.

### Storage Policies
After creating the bucket, go to **Storage** → **Policies** → Select `item-images` bucket:

1. Click **New Policy** → **For full customization**:

**Policy 1 — Public Read:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');
```

**Policy 2 — Authenticated Upload:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');
```

**Policy 3 — Delete own files:**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[2]);
```

---

## 6. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/college-lost-found.git
cd college-lost-found

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 7. Setting Up Admin User

After registering a user, run this in Supabase SQL Editor to make them admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

> ⚠️ This can only be done from the Supabase dashboard — users cannot self-assign admin roles.

---

## 8. Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init  # (already done by create-next-app)
git add .
git commit -m "Initial commit: CampusFinder"
git remote add origin https://github.com/your-username/college-lost-found.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. Click **New Project**.
3. Import your GitHub repository.
4. Vercel auto-detects Next.js — no framework configuration needed.

### Step 3: Add Environment Variables in Vercel
1. During import (or in Project Settings → Environment Variables), add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Supabase anon key
2. Click **Deploy**.

### Step 4: Update Supabase Auth Redirect URLs
After deployment, copy your Vercel production URL (e.g., `https://college-lost-found.vercel.app`).

Go to Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://college-lost-found.vercel.app`
- **Redirect URLs**: Add `https://college-lost-found.vercel.app/**`

---

## 9. Troubleshooting Common Issues

| Issue | Solution |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` missing | Add to `.env.local` and restart dev server |
| Auth redirect loop | Check Site URL in Supabase auth settings matches your domain |
| Images not loading | Verify `item-images` bucket is **public** in Supabase Storage |
| RLS blocking queries | Ensure you ran the full SQL migration including all RLS policies |
| Profile not created on signup | Verify the `on_auth_user_created` trigger was created successfully |
| Admin page shows blank | Update your profile `role` to `'admin'` in Supabase SQL Editor |
| Build fails on Vercel | Check environment variables are added in Vercel project settings |

---

## 10. Security Checklist

- [x] `.env.local` is in `.gitignore` — never committed
- [x] Supabase service role key is never exposed in browser code
- [x] RLS enabled on all tables
- [x] Users cannot self-assign admin role
- [x] Claims only visible to claimant and finder
- [x] Notifications only visible to the recipient user
- [x] Image MIME type validation on upload
- [x] Form validation on all inputs

---

## 11. Environment Variables Summary

```
NEXT_PUBLIC_SUPABASE_URL          → Required. From Supabase Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY → Required. From Supabase Project Settings → API → anon public key
SUPABASE_SECRET_KEY               → Optional. Service role key — NEVER expose in frontend code
```
