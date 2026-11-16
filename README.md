# 💐 Petal Post

Send flowers that never wilt. Build a bouquet, write a note and share one link. Your person opens an envelope and watches it bloom.

**Live:** https://codemitvishal.github.io/petal-post/

## Features

- 28 flowers with meanings, as a Posy, Classic or Grand bouquet
- Occasion presets and "Inspire me" notes
- Animated envelope, growing bouquet and handwritten note
- Surprise date, photo on the note, send flowers back, keepsake image
- Optional public flower wall

## Privacy

Your note lives only in the link. The wall stores first names and flowers, and only if you opt in.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. The flower wall stays off locally.

## Flower wall setup

1. Run `supabase/schema.sql` in a Supabase project.
2. Add the repository secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
3. Set **Settings → Pages → Source** to **GitHub Actions**.

Made by Vishal Singh.
