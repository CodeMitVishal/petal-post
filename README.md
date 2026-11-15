# 💐 Petal Post — send flowers that never wilt

Petal Post lets you build a bouquet, write a note and send it as a link. When your person opens the link, an envelope unseals, the bouquet grows stem by stem and your note writes itself out.

**Live site:** https://codemitvishal.github.io/petal-post/

## Use cases

| Who | Need | How Petal Post handles it |
| --- | --- | --- |
| Sender in a hurry | Send something thoughtful in under a minute | Pick an **occasion** (Love, Birthday, Thank you, Sorry, Get well, Congrats, Thinking of you, Just because) to get a ready-made bouquet, wrap and note. |
| Sender who wants it personal | Choose the exact flowers | **28 flowers** (roses, peonies, hydrangeas, orchids, gerberas, poppies, eucalyptus…) with a **mood filter** (Romantic, Cheerful, Calm, Elegant, Fillers). Each shows its **meaning**. Rearrange, "Surprise me", remove single stems. |
| Sender who wants it small or grand | Pick a size | **Posy** (short, up to 7 stems), **Classic** (up to 12) or **Grand** (tall, three rows, up to 24). Shrinking keeps extra stems aside and brings them back when you size up again. |
| Two people, one computer or network | Never collide | Each tab keeps its **own draft**, so two bouquets in two tabs don't overwrite each other; a new tab resumes the newest draft that isn't open elsewhere. On the wall, each browser has an **anonymous id**, so two different "Sam → Maya" senders stay separate rows and only the busy browser gets rate-limited, not everyone on the same Wi-Fi. |
| Sender lost for words | Help writing the note | **Inspire me** cycles through notes written for the chosen occasion. 280-character limit with a live counter. |
| Sender planning ahead | Deliver on the day | **Surprise date**: the envelope stays sealed with a live countdown until that day. |
| Sender before sharing | See what they'll see | **Preview as them** opens the recipient view, with a "Back to editing" button. |
| Sharing | Get it to the person | Copy link, WhatsApp, email, or the device's share sheet. |
| Recipient | A moment, not just a message | Envelope opens with a petal burst, the bouquet grows, the note types out and the flower meanings appear. |
| Recipient | Reply in kind | **Send flowers back** opens the builder with the names swapped. |
| Recipient | Keep it | **Save keepsake** downloads a 1080×1350 PNG of the bouquet, note and photo. |
| Sender | Make it personal | **Add a photo** to the note: it's pinned to the card like a polaroid when the envelope opens. |
| Everyone | Faces on the wall | Optional round photos of sender and recipient next to their names on the public wall. |
| Everyone | See who's sending flowers | The **public flower wall** shows who sent flowers to whom, how many bouquets and stems, and which flowers, plus live totals. Senders opt in per gift. |
| Everyone | Privacy | The note, link and surprise date never leave the link's `#hash`. The wall stores only first names, occasion and flower codes, and only when the sender ticks the box. |
| Everyone | Accessibility | Keyboard-operable, labelled controls, and `prefers-reduced-motion` turns off falling petals and long animations. |

## Public flower wall (setup, about 5 minutes)

GitHub Pages can't store data, so the wall uses a free [Supabase](https://supabase.com) database. Until it's configured, the wall stays hidden and everything else works as before.

1. Create a free Supabase project.
2. Open **SQL Editor → New query**, paste [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. In **Project Settings → API** (or **Connect**), copy the **Project URL** and the **anon public** (or **publishable**) key.
4. Paste both into [`js/config.js`](js/config.js), then commit and push.

What the database allows: visitors can **add** a gift (first names checked against letters only, max 20 chars, 1–24 stems) and read two summaries, `gift_stats()` for the totals and `gift_wall()` for one row per person → recipient with counts (people are told apart by an anonymous per-browser id that is never returned to the page). Raw rows can't be read, edited or deleted from the site. To remove an entry, delete it in Supabase's **Table Editor**.

## Security

- **No HTML injection:** everything people type (names, notes, wall data) is inserted with `textContent`. Gift links are validated field by field (known flower codes, lengths, UUID photo ids).
- **Content Security Policy:** scripts only from this site; network and images only from Supabase; no plugins, forms or `<base>` tags.
- **Database:** visitors can only *add* wall entries (specific columns) and read two summaries. Raw rows, the IP salt and anything else are off limits. Names, flower codes and photo ids are validated in Postgres.
- **Rate limits (per person, not per network):** 6 wall entries per browser every 10 minutes; a loose 30 per IP every 10 minutes as a backstop, so an office or mobile network shared by many people isn't blocked by one busy sender; 60 per minute overall. IPs are only stored as salted hashes. Photos: 20 per minute and 400 per day overall.
- **Photos:** re-encoded in the browser, which strips GPS and camera data, and resized (max 1200 px, under 1 MB). The bucket only accepts JPEGs under random UUID names. Visitors can't list, overwrite or delete files.
- **Known limits:** the note travels inside the link, so the surprise date is a playful lock, not encryption. There's no automatic moderation of names or photos: remove entries in Supabase's Table Editor and photos in Storage. Photo links are unguessable but public to anyone who has them.

## Motion design

- **Falling petals:** a canvas particle layer that pauses when the tab is hidden, plus petal bursts on key moments (opening the envelope, copying the link, picking an occasion).
- **Growing bouquet:** stems draw in with `stroke-dashoffset`, heads bloom with a spring curve, then gently "breathe", and the whole bouquet sways.
- **Live re-arrangement:** when you add or remove a flower, the existing stems glide to their new places with CSS transitions instead of jumping.
- **Envelope reveal:** a 3D flap flip, the seal cracks, the letter rises, then the stage hands over to the bouquet.
- **Small touches:** view transitions between pages, staggered scroll reveals, a fluttering gift tag, a hero tilt that follows the cursor, a looping flower-meaning marquee.

## Tech

Plain HTML, CSS and JavaScript with no build step. All flowers are procedural SVG (`js/flowers.js`), so a whole bouquet fits in a short URL.

```
index.html      views: home, builder, gift
css/styles.css  design tokens, layout, animations
js/flowers.js   flower catalog, SVG heads, bouquet layout
js/app.js       routing, builder state, gift reveal, petals, keepsake, flower wall
js/config.js    Supabase URL + public key for the flower wall (empty = wall off)
supabase/       database schema for the flower wall
```

Run locally:

```bash
python -m http.server 8000
```

then open http://localhost:8000.
