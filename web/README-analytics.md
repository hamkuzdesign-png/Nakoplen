# Shared analytics setup (Supabase)

Without setup, `/stats` only shows events from the current browser
(`localStorage`). To see every participant who opens the GitHub Pages link:

1. Create a free project at [supabase.com](https://supabase.com).
2. Project → **SQL Editor** → run [`supabase/schema.sql`](supabase/schema.sql).
3. Project → **Settings → API** → copy the **Project URL** and the **anon
   public** key.
4. Add them as repo secrets (Settings → Secrets and variables → Actions) so
   the GitHub Pages build picks them up:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. For local dev / the ngrok prod server, copy `.env.local.example` to
   `.env.local` in `web/` and fill in the same two values.

Once deployed, every device that opens the prototype link writes its events
to the shared `events` table, and `/stats` reads all of them. The anon key is
meant to be public — it ends up in the deployed JS bundle either way — Row
Level Security (from the schema) is what keeps writes append-only and blocks
edits/deletes.
