# Admin login (email + password)

For **production deployment**, see [DEPLOY.md](./DEPLOY.md).

The CRM at `/admin/login` uses **Supabase email/password** authentication (`signInWithPassword`). Sessions persist via the Supabase client (`persistSession` / `autoRefreshToken`).

## 1. Environment variables

```env
VITE_SUPABASE_URL=https://nwdyywbtbgdbdwneovme.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_ADMIN_AUTH_REDIRECT_URL=https://www.honeywelltravel.com.cy/admin/dashboard
```

Use the **base** project URL only (no `/rest/v1/`). Restart the dev server after changing `.env`.

**Important:** In Supabase → **Authentication** → **Attack Protection**, turn **Captcha** **off**.

## 2. Supabase Auth settings

1. Supabase → **Authentication** → **Providers** → **Email**.
2. Enable **Email** provider.
3. Enable **Email password** sign-in (disable Magic Link if you no longer want it).
4. Under **URL Configuration**, add:
   - `https://www.honeywelltravel.com.cy/**`
   - `http://localhost:5173/**` (local testing)
5. Optional: disable public sign-ups if only invited staff should have accounts.

## 3. Create staff users

**Option A — Dashboard**
1. **Authentication** → **Users** → **Add user**
2. Enter email + password
3. Enable **Auto Confirm User**

**Option B — App signup**
1. Open `/admin/signup`
2. Create account with email + password (`supabase.auth.signUp`)

## 4. User experience

| Step | What happens |
|------|----------------|
| 1 | Open `/admin/login`, enter email + password, click **Sign in** |
| 2 | On success, redirect to `/admin/dashboard` |
| 3 | Session stays until **Sign out** |
| 4 | Wrong credentials show: *Invalid email or password.* |

## 5. Troubleshooting

| Message | Fix |
|--------|-----|
| Invalid email or password | Check credentials; create/reset user in Supabase |
| Email not confirmed | Auto-confirm the user in Authentication → Users |
| Invalid API key | Fix `VITE_SUPABASE_URL` + publishable `VITE_SUPABASE_ANON_KEY` on Vercel and redeploy |
| Supabase is not configured | Set `VITE_SUPABASE_*` in hosting env |

## 6. Design preview (local only)

Open `http://localhost:5173/admin/dashboard?preview=dev` for layout-only browsing without login.

## 7. Protected routes

All `/admin/*` routes except `/admin/login`, `/admin/signup`, and `/admin/forgot-password` require a valid Supabase session.

## 8. Packages CMS

Staff can edit package prices and dates at **`/admin/packages`**. Setup steps: [PACKAGES_CMS.md](./PACKAGES_CMS.md).
