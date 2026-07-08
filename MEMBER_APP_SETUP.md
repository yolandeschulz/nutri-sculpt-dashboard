# nutri-SCULPT Member App Setup

This app can run in two modes:

- Public tracker mode: `member-config.js` has `enabled: false`.
- Member app mode: `member-config.js` has Supabase details and `enabled: true`.

The current MVP is a paid-access gate. It keeps the existing dashboard and saved-data key, but asks users to sign in before opening the tracker.

## Phase 1: Manual Paid Access MVP

1. Create a Supabase project.
2. Run `supabase-setup.sql` in the Supabase SQL editor.
3. In Supabase Auth, enable email/password sign-in.
4. Copy the project URL and anon/public key.
5. Update `member-config.js`:

```js
window.NUTRI_MEMBER_CONFIG = {
  enabled: true,
  appName: "nutri-SCULPT Member App",
  priceLabel: "R99/month",
  supportEmail: "your-support-email@example.com",
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-SUPABASE-ANON-KEY",
  paystackPaymentUrl: "https://paystack.com/pay/YOUR-PAYMENT-LINK"
};
```

The Supabase anon key is designed to be public. Do not add a Supabase service-role key to this app.

6. Test sign-up with your own email.
7. In Supabase, mark your test user active:

```sql
update public.member_access
set access_status = 'active',
    subscription_status = 'active',
    updated_at = now()
where email = 'your-email@example.com';
```

8. Sign in again and confirm the dashboard opens.

## Phase 2: Paystack Automation

The MVP can open a Paystack payment link, but it does not yet automatically approve paid users.

To automate subscriptions:

1. Create a small backend or serverless function.
2. Add a Paystack webhook endpoint.
3. Verify Paystack webhook signatures on the backend.
4. When payment or subscription is active, update `public.member_access`.
5. When payment fails or subscription is cancelled, set the user inactive or past due.

Do not put Paystack secret keys in this static app. Secret keys belong only in the backend.

## Protection Note

This Phase 1 gate is enough for normal paid-client testing, but it is still a static app. A technical person could inspect public app files.

For stronger commercial protection, move the paid app to protected hosting and load programme content only after a valid member session is confirmed.

## Data Note

The dashboard still uses:

```text
nutriSculptDashboardState.v1
```

That preserves existing phone/browser data and backup/restore compatibility.
