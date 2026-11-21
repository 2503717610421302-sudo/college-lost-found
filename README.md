# CampusFinder — College Lost & Found Management System

A complete, production-ready College Lost & Found platform built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication** — Supabase email/password auth with email verification
- 📋 **Lost & Found Reports** — Detailed item reporting with image uploads
- 🔍 **Search & Filters** — Full-text search with category, location, status filters
- 📬 **Recovery Claims** — Complete claim workflow with proof submission
- 🔔 **Notifications** — In-app notifications for claim updates
- 👨‍💼 **Admin Dashboard** — Platform oversight and content moderation
- 📱 **Responsive** — Mobile-first design

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Quick Start

```bash
git clone <repo-url>
cd college-lost-found
npm install
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
npm run dev
```

## Setup Guide

See [API_KEYS_AND_SETUP.md](./API_KEYS_AND_SETUP.md) for the full setup guide including:
- Supabase project creation
- Database migrations
- Storage bucket configuration
- Vercel deployment
- Admin user setup

## Project Structure

```
college-lost-found/
├── app/
│   ├── (auth)/              # Login, Register, Forgot/Reset Password
│   ├── (app)/               # Protected pages
│   │   ├── dashboard/
│   │   ├── report-lost/
│   │   ├── report-found/
│   │   ├── my-reports/
│   │   ├── my-claims/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── admin/
│   │   └── items/[id]/
│   ├── browse-lost/
│   ├── browse-found/
│   ├── layout.js
│   └── page.js              # Landing page
├── components/
│   ├── layout/              # Navbar, Footer
│   ├── ui/                  # Button, Input, Skeleton, ConfirmDialog
│   └── items/               # ItemCard, ItemGrid, SearchFilters
├── contexts/                # AuthContext, ToastContext
├── lib/
│   ├── supabase/            # client.js, server.js, middleware.js
│   ├── constants.js
│   └── utils.js
├── supabase/migrations/     # SQL migration files
├── middleware.js
└── .env.example
```

## Database Schema

- **profiles** — User profiles (extends Supabase auth)
- **items** — Lost and found item reports
- **claims** — Recovery requests and their status
- **notifications** — In-app notifications
- **reports** — Content moderation reports

All tables have Row Level Security (RLS) enabled.

## License

MIT
