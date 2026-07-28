# Packages CMS

Employee workspace for searching and updating travel packages live.

**Preferred entry:** Travel Hub CRM → **Packages** (same login as the rest of the CRM, shared `cms_packages` table).

Honeywell `/admin/packages` remains available as a fallback against the same database.

## Setup (once)

1. Open **Supabase → SQL Editor** (Travel Hub project `nwdyywbtbgdbdwneovme`)
2. Paste and run [`supabase/fix_packages_cms.sql`](../supabase/fix_packages_cms.sql) (or Travel Hub migration `023_cms_packages.sql`)
3. Confirm `cms_packages` exists under **Table Editor**

## Sign in (Honeywell admin fallback)

1. Open `/admin/login`
2. Sign in with email + password
3. You land on **`/admin/packages`**

## Use

1. Click **New package** to create one (starts as **Draft**)
2. Fill Basics (title, website ID, destination, price), then Hotels, Program, Media
3. For images: put files in `public/images/…` and paste paths like `/images/greece/athens-cover.webp`
4. Set status to **Published** when ready, then **Save** / **Create package**
5. Or **Edit** an existing package from the list / search / filters

Published CMS packages override the static website catalog on `/packages` and package detail pages.

**Exception:** if a static package sets `details.codeUpdatedAt` to a timestamp **newer** than the CMS row’s `updated_at`, the website uses the code version (so code fixes are not overwritten by a stale CMS import). After you fix the package in CMS (or re-run **Import from website** while logged in), CMS becomes current again.

**Hidden** or **Draft** packages are removed from the public site (they no longer fall back to the static catalog copy).

## Import

Use **Import from website** once (or when you want to refresh from `src/data/packages.js`). Matching rows are overwritten by package ID.

Or from a machine with the Travel Hub **service_role** JWT in `.env`:

```bash
npm run sync:cms-packages
```

You must be **logged in** as admin for import/save (RLS). For server-side scripts (`npm run sync:cms-packages`), set `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) to the Travel Hub project’s JWT **service_role** key — the same project as `VITE_SUPABASE_URL` (`nwdyywbtbgdbdwneovme`).

## Images

Keep folders under `public/images/…` **or** paste a Google/web **Copy image address** (`https://…`) into Cover / Thumbnail / hotel Image fields. A live preview confirms the link works.

## Notes

- Old CRM URLs (`/admin/clients`, `/admin/leads`, etc.) redirect to Packages CMS
- Deleting a CMS row does not delete the code copy in `packages.js`
- After **Save**, the public catalog cache is cleared immediately and other open tabs are notified
- Public package pages force-refresh on open / tab focus (fallback cache max ~8 seconds)
- After marking **Hidden** or changing prices, refresh the public page once to confirm
