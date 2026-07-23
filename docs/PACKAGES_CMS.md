# Packages CMS (employee editor)

Employees can edit package prices, departure dates, hotels, and visibility without changing code.

## Setup (once)

1. Open **Supabase → SQL Editor**
2. Paste and run [`supabase/fix_packages_cms.sql`](../supabase/fix_packages_cms.sql)
3. Confirm `cms_packages` exists under **Table Editor**

## Use

1. Sign in at `/admin/login`
2. Open **Packages CMS** in the sidebar (`/admin/packages`)
3. Click **Import from website** (loads all packages from `src/data/packages.js` into Supabase)
4. Click **Edit** on a package
5. Change **From price**, **Departure dates**, or hotel **Double €/pp** rows
6. Click **Save changes**

Published CMS packages override the static website data on:

- `/packages` listing
- Package detail pages (`PackageFullDetail`)

Cache refreshes about every 60 seconds (or immediately after admin save in the same browser session after navigation).

## Images

Keep using organized folders under `public/images/…` by country/destination, e.g.:

`/images/christmas-packages/london/christmas-cover-london.webp`

Paste those paths into **Cover image** / hotel **Image path** fields.

Optional Storage bucket `package-images` is created by the SQL script for a later drag-and-drop upload phase.

## Notes

- **Import from website** overwrites matching CMS rows by package ID.
- Deleting a CMS row does not delete the code copy in `packages.js`.
- Package Calculator (`/admin/package-calculator`) is separate (client quotes), not the public catalog.
