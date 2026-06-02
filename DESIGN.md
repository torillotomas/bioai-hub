# Design System — BioAI Hub

## Product Context

- **What this is:** Medical chest X-ray analysis platform powered by DenseNet121 (torchxrayvision). Detects 18 pathologies from uploaded radiographs.
- **Who it's for:** Medical professionals — radiologists, doctors. Spanish (Argentine) interface.
- **Space/industry:** Medical AI / clinical decision support tools
- **Project type:** Web app / diagnostic dashboard
- **Memorable thing:** "Tecnología de punta, accesible" — cutting-edge AI, approachable UX

---

## Aesthetic Direction

- **Direction:** Precisión Cálida (Precision-Warm)
- **Decoration level:** Intentional — texture comes from typography and data, not ornaments. No blobs, no decorative dividers, no gradient backgrounds.
- **Mood:** A premium radiology lab, not a startup dashboard. Calm, controlled, precise. Looks like it was made by people who understand medicine.
- **What this is NOT:** Clinical cold blue. Purple gradient AI. Generic SaaS.

---

## Typography

- **Brand/Display:** [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) — Serif in a tech context signals seriousness and character. Used for the "BioAI Hub" wordmark, section headings in the DiagnosisCard, and h1/h2 display contexts.
- **UI/Body:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) — Clean, neutral, optimized for data and small UI labels. Replaces Inter. Used for all body text, form labels, buttons, and navigation.
- **Data/Numbers:** DM Sans with `font-variant-numeric: tabular-nums` — confidence percentages, inference times, SHA-256 hashes. Numbers must align in columns.
- **Code:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — analysis IDs, model versions, SHA hashes. Used sparingly.
- **Loading:** Google Fonts via preconnect + `<link>` in `index.html`. `display=swap`.

### Type Scale

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| display | 42px | 400 (Instrument Serif) | Hero / large wordmark |
| h1 | 28px | 400 (Instrument Serif) | Page-level headings |
| h2 | 20–22px | 600 (DM Sans) | Section headings |
| h3 | 16px | 600 (DM Sans) | Card / panel headings |
| body | 15px | 400 (DM Sans) | All body text |
| small | 13px | 400 (DM Sans) | Secondary info, form hints |
| label | 11–12px | 600 (DM Sans) | UPPERCASE TRACKING labels |
| mono | 13–14px | 400–500 (JetBrains Mono) | Data values, IDs, hashes |

---

## Color

- **Approach:** Restrained — one accent color, warm neutral scale. Color is rare and meaningful.

### Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--color-bg` | `#f5f4f0` | Page background — warm off-white, not cold gray-50 |
| `--color-surface` | `#ffffff` | Cards, panels, modals |
| `--color-surface-2` | `#f0efeb` | Hover states, secondary surfaces |
| `--color-border` | `#e4e2dc` | Card and input borders |
| `--color-border-subtle` | `#ede9e2` | Section dividers inside cards |
| `--color-text` | `#1a1a1e` | Primary text — near-black with warmth |
| `--color-text-muted` | `#6b6b72` | Secondary text, form labels |
| `--color-text-faint` | `#a0a0a8` | Hints, metadata, timestamps |
| `--color-accent` | `#047857` | Primary CTA, focus rings, active states |
| `--color-accent-hover` | `#065f46` | Accent on hover/press |
| `--color-accent-light` | `#d1fae5` | Low-severity pathology badges |
| `--color-accent-subtle` | `#ecfdf5` | Dropzone hover, accent backgrounds |

### Semantic colors (confidence & severity)

| Token | Hex | Use |
|-------|-----|-----|
| `--color-danger` | `#dc2626` | High confidence pathology (>60%), errors |
| `--color-warning` | `#d97706` | Medium confidence (30–60%), warnings |
| `--color-success` | `#047857` | Low confidence (<30%), success states |
| `--color-info` | `#0369a1` | Info states |

### Dark mode

Not implemented currently. If added: use `color-scheme: dark`, surfaces via elevation (not lightness inversion), desaturate accent 10–20%, text off-white ~#e0e0e0 (not pure white).

---

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable — not spacious (we show medical data), not cramped

| Token | Value | Use |
|-------|-------|-----|
| 2xs | 2px | Micro gaps |
| xs | 4px | Tight gaps between inline elements |
| sm | 8px | Base — compact padding, gap between labels and fields |
| md | 16px | Standard padding within cards |
| lg | 24px | Card padding, section gaps |
| xl | 32px | Between sections |
| 2xl | 48px | Page-level vertical rhythm |
| 3xl | 64px | Major section breaks |

---

## Layout

- **Approach:** Grid-disciplined
- **Dashboard:** 2-column flex (sidebar 256px + flex-1 main). Stack to single column below `sm` breakpoint.
- **Max content width:** 1140px (`max-w-5xl`) centered
- **Auth pages:** Single centered column, card max-width 400px

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Tags, inline badges, small chips |
| `--radius-md` | 8px | Buttons, inputs, select |
| `--radius-lg` | 12px | Small cards, dropzone |
| `--radius-xl` | 16px | Main cards, panels, app chrome |
| `--radius-full` | 9999px | Confidence badges, pill labels |

---

## Motion

- **Approach:** Intentional — every animation communicates something (state change, entrance, feedback). No decorative motion.
- **Easing:** `ease-out` for entering, `ease-in` for exiting, `ease-in-out` for moving
- **Duration:** micro 50–100ms, short 150–250ms, medium 250–400ms
- **`prefers-reduced-motion`:** All animations must respect this. Use `@media (prefers-reduced-motion: reduce)` guards.
- **Only animate:** `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`.
- **Specific animations:**
  - DiagnosisCard entrance: fade-in + translate-y (medium, ease-out)
  - Probability bars: width from 0 to value (medium, ease-out, staggered per row)
  - Button hover: background-color (micro, ease-out)
  - Dropzone hover: border-color + background (micro, ease-out)
  - ErrorBanner entrance: translate-y from -8px (short, ease-out)

---

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(26,26,30,.06), 0 1px 3px rgba(26,26,30,.08);
--shadow-md: 0 2px 8px rgba(26,26,30,.08), 0 2px 12px rgba(26,26,30,.06);
--shadow-lg: 0 8px 24px rgba(26,26,30,.10), 0 2px 8px rgba(26,26,30,.06);
```

Cards use `shadow-sm`. Modals and overlays use `shadow-lg`. No colored shadows.

---

## Anti-patterns (never add these)

- Purple/violet gradients as backgrounds or hero sections
- Icons in colored circles as section decoration
- Centered everything (text-align: center on all headings)
- Uniform bubbly border-radius on all elements
- Decorative blobs, wavy SVG dividers, floating circles
- Emoji as design elements (use inline SVG icons instead)
- system-ui / -apple-system as the primary font (we have DM Sans)
- Generic hero copy ("Welcome to...", "Unlock the power of...")
- Gradient CTA buttons

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-02 | Initial design system created | /design-consultation. Direction: Precisión Cálida |
| 2026-06-02 | Instrument Serif for brand/display | Risk: serif in tech context = seriousness + character. Different from every medical SaaS |
| 2026-06-02 | Emerald #047857 as accent | Risk: breaks away from sky-blue that every medical AI product uses |
| 2026-06-02 | Warm off-white #f5f4f0 background | Risk: replaces cold gray-50, feels premium/paper-like |
| 2026-06-02 | DM Sans replaces Inter | Inter is the "I gave up on typography" signal. DM Sans is equally neutral but less cliché |
| 2026-06-02 | /design-review: Inter added as interim | Replaced by DM Sans + Instrument Serif in this system |
