# Admin login (Magic Link)

For **production deployment**, see [DEPLOY.md](./DEPLOY.md).

The CRM at `/admin/login` uses **Supabase Magic Link** (OTP email). Staff enter their email and receive a one-time link — no password on the login page.

## 1. Environment variables

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_ADMIN_AUTH_REDIRECT_URL=https://www.honeywelltravel.com.cy/admin/dashboard
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
```

For local dev, omit `VITE_ADMIN_AUTH_REDIRECT_URL` — the app uses `http://localhost:5173/admin/dashboard` automatically.

If your Supabase project has **Auth → Bot and Abuse Protection → hCaptcha** enabled, the login page must send a captcha token (the checkbox above the Send Login Link button). Alternatively, you can turn off hCaptcha in Supabase for staff-only CRM access.

Restart the dev server after changing `.env`.

## 2. Supabase Auth settings

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers** → **Email**.
2. Enable **Email provider**.
3. Enable **Magic Link** (or “Confirm email” flow that sends magic links).
4. Under **URL Configuration** → **Redirect URLs**, add:
   - `https://www.honeywelltravel.com.cy/admin/dashboard`
   - `http://localhost:5173/admin/dashboard` (for local testing)
5. **Authentication** → **Providers** → disable public sign-ups if shown, or ensure only invited users exist.
6. The app calls `signInWithOtp` with `shouldCreateUser: false` — only emails that already exist in **Authentication → Users** receive a link.

## 3. Create staff users (no public signup)

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter the employee email (e.g. `name@company.com`).
3. Enable **Auto Confirm User**.
4. Do **not** share the `/admin/signup` URL — it redirects to login.

## 4. User experience

| Step | What happens |
|------|----------------|
| 1 | User opens `/admin/login`, enters email, completes the security check, clicks **Send Login Link** |
| 2 | Success: *Check your email for your secure login link.* |
| 3 | User clicks the link in email |
| 4 | Browser opens `https://www.honeywelltravel.com.cy/admin/dashboard` — session is restored and the dashboard loads directly (no login page in between) |
| 5 | **Sign out** in the sidebar clears the session |

Unknown emails see: **You are not authorized to access this CRM.**

## 5. Troubleshooting

| Message | Fix |
|--------|-----|
| You are not authorized… | Add that email in Supabase **Authentication → Users** |
| Link opens but not logged in | Add redirect URL in Supabase URL Configuration |
| Email not received | Check spam; verify SMTP / Supabase email limits |
| Supabase is not configured | Set `VITE_SUPABASE_*` in hosting env |

## 6. Protected routes

All `/admin/*` routes except `/admin/login` require a valid Supabase session. Unauthenticated users are redirected to `/admin/login`.
