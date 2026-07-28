# Packages CMS

Employee workspace for searching and updating travel packages live. The admin area is **Packages CMS only** (no Clients / Leads / CRM modules).

## Setup (once)

1. Open **Supabase → SQL Editor**
2. Paste and run [`supabase/fix_packages_cms.sql`](../supabase/fix_packages_cms.sql)
3. Confirm `cms_packages` exists under **Table Editor**

## Sign in

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

You must be **logged in** as admin for import/save (RLS). The local `SUPABASE_SECRET_KEY` in `.env` must be a valid **service_role / secret** key for the same project as `VITE_SUPABASE_URL` if you use server-side scripts.

## Images

Keep folders under `public/images/…` **or** paste a Google/web **Copy image address** (`https://…`) into Cover / Thumbnail / hotel Image fields. A live preview confirms the link works.

## Notes

- Old CRM URLs (`/admin/clients`, `/admin/leads`, etc.) redirect to Packages CMS
- Deleting a CMS row does not delete the code copy in `packages.js`
- After **Save**, the public catalog cache is cleared immediately and other open tabs are notified
- Public package pages force-refresh on open / tab focus (fallback cache max ~8 seconds)
- After marking **Hidden** or changing prices, refresh the public page once to confirm
