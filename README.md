# 💐 Petal Post — send flowers that never wilt

Petal Post lets you build a bouquet, write a note and send it as a link. When your person opens the link, an envelope unseals, the bouquet grows stem by stem and your note writes itself out.

**Live site:** https://codemitvishal.github.io/petal-post/

## Use cases

| Who | Need | How Petal Post handles it |
| --- | --- | --- |
| Sender in a hurry | Send something thoughtful in under a minute | Pick an **occasion** (Love, Birthday, Thank you, Sorry, Get well, Congrats, Thinking of you, Just because) to get a ready-made bouquet, wrap and note. |
| Sender who wants it personal | Choose the exact flowers | 13 flowers, up to 12 stems. Each shows its **meaning** (e.g. red rose: deep love). Rearrange, "Surprise me", remove single stems. |
| Sender lost for words | Help writing the note | **Inspire me** cycles through notes written for the chosen occasion. 280-character limit with a live counter. |
| Sender planning ahead | Deliver on the day | **Surprise date**: the envelope stays sealed with a live countdown until that day. |
| Sender before sharing | See what they'll see | **Preview as them** opens the recipient view, with a "Back to editing" button. |
| Sharing | Get it to the person | Copy link, WhatsApp, email, or the device's share sheet. |
| Recipient | A moment, not just a message | Envelope opens with a petal burst, the bouquet grows, the note types out and the flower meanings appear. |
| Recipient | Reply in kind | **Send flowers back** opens the builder with the names swapped. |
| Recipient | Keep it | **Save keepsake** downloads a 1080×1350 PNG of the bouquet and note. |
| Everyone | Privacy | No backend, no accounts, no tracking. The bouquet is encoded in the link's `#hash`, which the browser never sends to a server. |
| Everyone | Accessibility | Keyboard-operable, labelled controls, and `prefers-reduced-motion` turns off falling petals and long animations. |

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
js/app.js       routing, builder state, gift reveal, petals, keepsake
```

Run locally:

```bash
python -m http.server 8000
```

then open http://localhost:8000.
