# Admin login (email + password)

For **production deployment**, see [DEPLOY.md](./DEPLOY.md).

The admin at `/admin/login` uses **Supabase email/password** authentication. After login you enter the **Packages CMS** at `/admin/packages`.

## 1. Environment variables

```env
VITE_SUPABASE_URL=https://nwdyywbtbgdbdwneovme.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_ADMIN_AUTH_REDIRECT_URL=4
```

Use the **base** project URL only (no `/rest/v1/`). Restart the dev server after changing `.env`.

**Important:** In Supabase → **Authentication** → **Attack Protection**, turn **Captcha** **off**.

## 2. Supabase Auth settings

1. Supabase → **Authentication** → **Providers** → **Email**
2. Enable email/password sign-in
3. Under **URL Configuration**, add:
   - `https://www.honeywelltravel.com.cy/**`
   - `http://localhost:5173/**`

## 3. Create staff users

**Dashboard:** Authentication → Users → Add user (email + password, Auto Confirm).

**Or** open `/admin/signup` and create an account.

### Display names (Welcome Back, …)

Friendly first names are mapped in `src/pages/admin/utils/adminUser.js`.

| Email | Shows as |
|-------|----------|
| `honeywelltravel1@asg.com.cy` | Alex |
| `honey@gmail.com` | Alex |
| `v.avraam@asg.com.cy` | Valentina |

When you add another staff account, add their email → first name in `DISPLAY_NAME_BY_EMAIL` so the header shows **Welcome Back, {Name}**.

## 4. User experience

| Step | What happens |
|------|----------------|
| 1 | Open `/admin/login`, enter email + password, click **Sign in** |
| 2 | Redirect to `/admin/packages` (Packages CMS) |
| 3 | Search/edit packages and **Save** to publish live |
| 4 | **Sign out** clears the session |

## 5. Troubleshooting

| Message | Fix |
|--------|-----|
| Invalid email or password | Check credentials; create/reset user in Supabase |
| Invalid path specified in request URL | `VITE_SUPABASE_URL` must not include `/rest/v1/` |
| Invalid API key | Fix publishable key on Vercel and redeploy |
| Supabase is not configured | Set `VITE_SUPABASE_*` in hosting env |

## 6. Design preview (local only)

Open `http://localhost:5173/admin/packages?preview=dev` for layout-only browsing without login.

## 7. Protected routes

Authenticated admin routes are Packages CMS only. Other former CRM paths redirect to `/admin/packages`.

## 8. Packages CMS guide

See [PACKAGES_CMS.md](./PACKAGES_CMS.md).
