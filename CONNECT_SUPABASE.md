# Connect frontend to Supabase

Your project is **LST** (Project ID: `xhfcerpeymkapyrginly`).

## 1. Get your anon key

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/xhfcerpeymkapyrginly/settings/api).
2. Under **Project API keys**, find **anon** **public**.
3. Click **Reveal** (or copy) and copy the key.

## 2. Put it in `.env.local`

Open `.env.local` in the project root and set:

```bash
VITE_SUPABASE_ANON_KEY=paste_the_anon_key_here
```

(Leave `VITE_SUPABASE_URL` as is; it’s already set for your project.)

## 3. Restart the dev server

Restart `npm run dev` (or your dev command) so the new env is loaded.

After that, the app will use your Supabase project and the “Supabase URL” log in the browser console will show your project URL.
