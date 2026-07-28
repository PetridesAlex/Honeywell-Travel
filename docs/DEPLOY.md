# Deploy Honeywell Travel (Vercel + Supabase)

Production site: **https://www.honeywelltravel.com.cy**  
Admin CRM: **https://www.honeywelltravel.com.cy/admin/login**

The repo is already set up for Vercel (`vercel.json`, `npm run build` → `dist/`).

---

## 1. Push latest code to GitHub

```bash
cd "/Users/petridesaalex/Desktop/Honeywell Travel Project"
git add .
git commit -m "CRM: Supabase project, admin login, deploy docs"
git push origin main
```

(Use your branch name if not `main`.)

---

## 2. Vercel environment variables

In [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Environment Variables**, add these for **Production** (and **Preview** if you use preview URLs):

| Name | Value | Notes |
|------|--------|--------|
| `VITE_SUPABASE_URL` | `https://nwdyywbtbgdbdwneovme.supabase.co` | Travel Hub CRM Supabase — base URL only, no `/rest/v1/` |
| `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | From Supabase → API → Publishable |
| `RESEND_API_KEY` | `re_...` | Server-side only — website form emails |
| `SUPABASE_SECRET_KEY` | JWT `service_role` key | Server-side only — `website_submissions` logging (legacy JWT preferred; `SUPABASE_SERVICE_ROLE_KEY` also works) |
| `CRM_AGENCY_API_KEY` | From Travel Hub → Settings → Agency Profile | Server-side only — lead sync |
| `CRM_INBOUND_URL` | `https://travel-hub-crm.vercel.app/api/leads/inbound` | Optional if using the default |

**Do not add** `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, or `CRM_AGENCY_API_KEY` with a `VITE_` prefix (browser build must not include them).

Copy values from your local `.env` (except secrets — paste those from Supabase / Travel Hub Settings).

After adding variables → **Deployments** → **Redeploy** latest (or push a new commit).

---

## 3. Supabase Auth (required for admin login on live site)

[Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/nwdyywbtbgdbdwneovme/auth/url-configuration)

| Field | Value |
|--------|--------|
| **Site URL** | `https://www.honeywelltravel.com.cy` |
| **Redirect URLs** | `https://www.honeywelltravel.com.cy/**` |
| | `http://localhost:5173/**` (keep for local dev) |

If you use a Vercel preview URL (e.g. `*.vercel.app`), add that too:

`https://your-project.vercel.app/**`

Save changes.

---

## 4. Connect / import project on Vercel (first time only)

1. [vercel.com/new](https://vercel.com/new) → **Import** `PetridesAlex/honeywell-travel`
2. Framework: **Vite** (auto-detected)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars from section 2
6. **Deploy**

Custom domain (if not already):

**Settings** → **Domains** → add `www.honeywelltravel.com.cy` and `honeywelltravel.com.cy`.

---

## 5. Verify production

| Check | URL |
|--------|-----|
| Homepage | https://www.honeywelltravel.com.cy |
| Admin login | https://www.honeywelltravel.com.cy/admin/login |
| Dashboard (after login) | https://www.honeywelltravel.com.cy/admin/dashboard |

Use the same Supabase Auth user you created locally.

Quick CRM test: add a client → add a lead with the same email → confirm they link.

---

## 6. Troubleshooting

| Issue | Fix |
|--------|-----|
| Admin login works locally but not on live | Add production URL in Supabase Auth URL config (section 3) |
| “Supabase is not configured” on live | Set `VITE_SUPABASE_*` on Vercel and redeploy |
| 404 on `/admin/leads` refresh | `vercel.json` rewrites are already configured |
| Leads/clients empty after deploy | Confirm Vercel points at Travel Hub project `nwdyywbtbgdbdwneovme` |
| CRM sync 503 / not configured | Set `CRM_AGENCY_API_KEY` on Vercel from Travel Hub → Settings → Agency Profile |
| `SUPABASE_SECRET_KEY` Invalid API key | Use the JWT **service_role** key (same as Travel Hub `SUPABASE_SERVICE_ROLE_KEY`), not a broken `sb_secret_` value |
| Build fails on Vercel | Run `npm run build` locally; fix errors before push |

---

## CLI deploy (optional)

If [Vercel CLI](https://vercel.com/docs/cli) is installed and logged in:

```bash
cd "/Users/petridesaalex/Desktop/Honeywell Travel Project"
vercel --prod
```

Env vars must still be set in the Vercel dashboard (or via `vercel env add`).

---

## Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel env vars set for **Travel Hub** Supabase (`nwdyywbtbgdbdwneovme`):
  - `VITE_SUPABASE_URL` + publishable/anon key
  - `SUPABASE_SECRET_KEY` = JWT **service_role** (same value as Travel Hub’s `SUPABASE_SERVICE_ROLE_KEY`)
  - `RESEND_API_KEY`
  - `CRM_AGENCY_API_KEY` (Travel Hub → Settings → Agency Profile for **Honeywell Travel**)
  - `CRM_INBOUND_URL` = `https://travel-hub-crm.vercel.app/api/leads/inbound`
- [ ] Supabase Site URL + Redirect URLs include production domain
- [ ] Redeploy after env changes
- [ ] `/admin/login` works on live site
- [ ] Form submission creates a lead in Travel Hub CRM
- [ ] Optional: `npm run sync:cms-packages` locally after package data changes
