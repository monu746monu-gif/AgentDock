# Auth Email Setup

Supabase's built-in Auth email service is only for development and is rate-limited. Use Resend for signup confirmations, password resets, magic links, and invite emails.

## Resend Setup

1. In Resend, add and verify a sending domain.
2. In Resend, open **Integrations** and connect **Supabase**.
3. Select the Supabase project and verified domain.
4. Configure a sender name and From address, for example:
   - Sender name: `AgentDock`
   - From address: `AgentDock <no-reply@auth.your-domain.com>`
5. In Supabase, confirm the Auth email provider settings.
6. In Supabase Auth settings, add the app URL to allowed redirect URLs:
   - Local: `http://localhost:3000/login`
   - Production: `https://your-domain.com/login`

The app already passes `emailRedirectTo` for signup confirmation and resend flows, so no app-side Resend API key is needed for Supabase Auth emails.

## Notes

- Do not put Resend API keys in `NEXT_PUBLIC_*` variables.
- Keep Auth email and marketing email on separate sending domains when possible.
- If emails still do not arrive, check Resend logs first, then Supabase Auth logs.
