# Admin login setup

For **production deployment** (Vercel, env vars, live admin URL), see [DEPLOY.md](./DEPLOY.md).

The admin portal at `/admin/login` uses **Supabase Authentication** (`signInWithPassword`).  
If you see **"Invalid login credentials"**, the form is working but Supabase does not recognise that email/password.

## 1. Environment variables

In `.env` (local) and your hosting provider (production), set:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # public key (browser)
SUPABASE_SECRET_KEY=sb_secret_...           # optional; scripts only — never VITE_

# CRM email (optional — defaults below)
VITE_CRM_FROM_EMAIL=honeywelltravel1@asg.com.cy
VITE_CRM_ADMIN_LOGIN_EMAIL=honey@gmail.com
VITE_CRM_ADMIN_DISPLAY_NAME=Alex
```

Restart the dev server after changing `.env`.

In [Supabase → Project Settings → API](https://supabase.com/dashboard/project/bgbgiazicjfpninnizjn/settings/api), use the **publishable** key for `VITE_SUPABASE_ANON_KEY` and the **secret** key only on the server (not in frontend env vars).

**URL must end with `.supabase.co`** (not `.supabase.com`).

## 2. Create an admin user in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Users**.
3. Click **Add user** → **Create new user**.
4. Enter the **email** and **password** you will use on `/admin/login`.
5. Enable **Auto Confirm User** (or confirm the user manually) so login is not blocked by email verification.

## 3. Try again

- Use the **exact same email** (lowercase is fine).
- Use the password set in Supabase (not an old password from another system).
- If needed: **Users** → your user → **Send password recovery** or set a new password.

## 4. Apply database policies

**New empty project?** Run the full script once: `supabase/bootstrap_new_project.sql` (copy SQL only, not the file path).

Otherwise run these migrations in the Supabase SQL editor:

- `supabase/migrations/20260520_create_leads_table.sql` (if `leads` does not exist yet)
- `supabase/migrations/20260506_crm_upgrade.sql`
- `supabase/migrations/20260521_lead_names.sql` (stores **name** and **surname** separately)
- `supabase/migrations/20260521_travel_crm_fields.sql` (trip type, priority, package interest)
- `supabase/migrations/20260523_align_clients_id_table.sql` — **required** for table **`clients`** at `/rest/v1/clients` (adds `id`, optional `passport_number`/`phone`, links `leads.client_id`)
- `supabase/migrations/20260524_corporate_groups.sql` — **Corporate groups** (partner companies, contacts)
- `supabase/migrations/20260525_client_financial_records.sql` — **Client accounting** (invoices, receipts, sell/net/margin)
- `supabase/migrations/20260526_team_hub.sql` — **Team hub** (shared tasks, messages, news)
- `supabase/migrations/20260527_team_task_types.sql` — **Task types** (check-in, payment deadlines on `team_tasks`)
- **Corporate not loading?** Run once: `supabase/fix_corporate_groups.sql` (table + RLS + API grants), then verify: `node scripts/test-corporate-groups-api.mjs`
- **Accounting not loading?** Run once: `supabase/fix_client_financials.sql`
- **Team hub not loading?** Run once: `supabase/fix_team_hub.sql`
- **Deadline types / check-in tasks?** Run once: `supabase/fix_team_task_types.sql`

## Troubleshooting

| Message | Cause |
|--------|--------|
| Invalid email or password | User missing in Auth, or wrong password |
| Email not confirmed | Turn on Auto Confirm or confirm user in dashboard |
| Supabase is not configured | Missing `VITE_SUPABASE_*` in `.env` |
| Sign in did not create a session | Rare; check browser blocks localStorage/cookies |

The website contact forms can work without admin login; only the admin area (`/admin/dashboard`, `/admin/leads`) requires a valid Supabase Auth user.

After login you land on the **Dashboard**. The sidebar includes:

- **Dashboard** — funnel, channels, today’s follow-ups, passport alerts
- **Team hub** — deadlines with due dates (check-in, payments), assign agents, link customers, news/updates
- **Corporate** — partner companies & group cooperations (company name, contacts, status)
- **Clients** — profiles with passport data, **Deadlines & check-ins** (due dates per customer), **Accounting & payments**
- **Leads** — enquiries linked to client profiles (export CSV)
- **Pipeline** — kanban by status (New → Confirmed)
- **Follow-ups** — daily call list with WhatsApp/call shortcuts
- **Reports** — source performance, revenue, trip types

### Client profiles workflow

Your client profiles API is:

`https://bgbgiazicjfpninnizjn.supabase.co/rest/v1/clients`

All client queries use `supabase.from('clients')` with these columns:

`first_name`, `last_name`, `email`, `phone`, `nationality`, `date_of_birth`, `passport_number`, `date_of_issue`, `date_of_expiry`, `notes`

1. Run `bootstrap_new_project.sql` or the migrations in the [SQL editor](https://supabase.com/dashboard/project/bgbgiazicjfpninnizjn/sql).
2. Open **Clients** in the admin sidebar → **+ Add client** (or edit from a lead drawer).
3. New website enquiries auto-link a client when the email matches.
4. Use **Clients** filters for passports expiring within 90 days, expired, or missing dates.

### Two different emails

| Purpose | Address |
|--------|---------|
| **Admin login** (`/admin/login`) | `honey@gmail.com` — create this user in Supabase **Authentication → Users** |
| **Client replies** (Send email in CRM) | `honeywelltravel1@asg.com.cy` — sign into **Outlook** with this mailbox |

They are separate on purpose: you log into the CRM with Gmail; you send customer emails from the Honeywell business address.

After login, the sidebar shows **Welcome, Alex** (or another name from `VITE_CRM_ADMIN_DISPLAY_NAME` / the user’s Supabase profile).

### Email replies (Outlook)

On **Clients**, **Leads** (drawer & table), **Follow-ups**, and **Corporate**, use **Send email** / **Email**:

- **Send email** / **Quick reply** — opens your default mail app. In Outlook, choose **`honeywelltravel1@asg.com.cy`** as the sending account (or set it as default).
- **Outlook Web** — opens compose with a **login hint** for `honeywelltravel1@asg.com.cy`. Sign in with that Microsoft 365 account when prompted.

Templates append a signature with `honeywelltravel1@asg.com.cy`. **Quick reply** leaves the body empty for you to type.

Override addresses in `.env`: `VITE_CRM_FROM_EMAIL`, `VITE_CRM_ADMIN_LOGIN_EMAIL`.

### Client accounting (for your accountant)

On each **client profile**, section **Accounting & payments**:

| Field | Meaning |
|-------|---------|
| **Sell price** | What the client pays (invoice amount) |
| **Net price** | Supplier / cost to Honeywell |
| **Margin** | Auto-calculated: sell − net (and % ) |
| **Amount received** | What the client has paid so far |
| **Outstanding** | Sell − received (still to collect) |

Record types: **Invoice**, **Receipt**, or **Booking**. Add invoice/receipt numbers, payment method, due dates, and link to an enquiry.

Run `supabase/fix_client_financials.sql` once if the section shows a missing-table error.

### Team hub (tasks & news)

Open **Team hub** in the sidebar:

**Tasks tab**
- Create tasks with title, what to do, assign to an agent, due date, priority
- Change status (to do → in progress → done)
- **Team messages** on each task — agents reply with updates/instructions

**News & updates tab**
- Post company news, reminders, policy changes
- Pin important posts to the top

Run `supabase/fix_team_hub.sql` once if you see a missing-table error.
