# ContribShield OSS — UI/UX and Design System

## 1. Design direction

The final interface follows the supplied reference images:

- premium black luxury landing page;
- warm orange ambient glow;
- open, spacious composition;
- dark glass cards with subtle borders;
- warm cream document/content surfaces;
- modern large sans-serif typography;
- practical widgets, not decorative clutter;
- restrained premium motion;
- horizontal navigation in the authenticated app.

The previous indigo/mint and neon-lime palette is not used.

## 2. Color tokens

```css
:root {
  --color-black: #000000;
  --color-black-hole: #222222;
  --color-coffee-bean: #2D120D;
  --color-rosewood: #6B0B0C;
  --color-electric-tangerine: #FF6D1F;
  --color-lemon-chiffon: #FFF8CA;
  --color-sustainable-linen: #FAF3E1;
  --color-recycled-cotton: #F5E7C6;
  --color-botticelli: #CDE3E8;
  --color-text-primary: #F5F3ED;
  --color-text-muted: #AAA9A1;
  --color-border-dark: rgba(245, 243, 237, 0.14);
}
```

### Semantic use

| Token | Use |
|---|---|
| Black/Pure black | Main landing and app canvas |
| Black Hole | Cards, panels and inactive toggle tracks |
| Coffee Bean | Warm deep surfaces and ambient gradients |
| Rosewood | Critical/high-risk states and destructive warnings |
| Electric Tangerine | Scan activity, energy, warnings and primary risk emphasis |
| Lemon Chiffon | Primary safe action, active state, success and progress |
| Sustainable Linen | Issue drafts, light document panels and soft backgrounds |
| Recycled Cotton | Secondary content surfaces and route nodes |
| Botticelli | Information/technology indicators and low-intensity accents |

## 3. Typography

- Use a clean modern sans-serif stack.
- Headings are large, light-to-medium weight with generous line height.
- Body copy is concise and muted.
- Labels are small uppercase with letter spacing.
- Code/evidence uses a monospace font.
- All interface copy is English.

Suggested stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

## 4. Landing page

### Header

```text
ContribShield | Process | Features | Safety | FAQs | Login | Sign up
```

Use a rounded dark glass header. Sign up is a Lemon Chiffon pill button.

### Hero

Left: concise value proposition and two CTAs. Right: animated glass scan dashboard. Background: Black Hole with a large Electric Tangerine arc/glow. Add small faded GitHub, git and code cards that fall/float slowly in the background; they are decorative context and must not obscure text.

### Sections

1. Process: Scan → Understand → Contribute.
2. Feature cards: Evidence-first, Beginner-friendly, Maintainer-safe.
3. Contribution Impact Graph.
4. Safety promise: Code verifies. Gemini explains. Human approves.
5. FAQ accordion.
6. Final CTA.

## 5. Auth screens

Use a dark premium layout with an orange ambient top glow and a centered glass card.

Signup fields: email, phone, password, re-enter password, terms consent.

Login fields: email or phone, password.

Required states: idle, focused, invalid, validating, submitting, success and server error. Use inline errors, not browser alerts.

## 6. Authenticated shell

The app uses a sticky horizontal menu:

```text
Dashboard | Scan Repository | Findings | Contributions + Stack | Issue Drafts | Profile
```

Use an active Lemon Chiffon underline, Electric Tangerine hover accent and Black Hole translucent surface. On small screens the nav scrolls horizontally.

## 7. Page specifications

### Dashboard

Open widgets for scan counts, recent repositories, open contributions, activity and the next best action. Avoid a dense admin-table appearance.

### Scan Repository

Large URL input, category checklist, read-only safety card and animated scan steps. The scan button is Lemon Chiffon; active processing uses Tangerine.

### Findings

Use a finding list and a detail panel. High-risk selected states use Rosewood; evidence uses Botticelli or Linen accents. Show exact file and line before any AI action.

### Contributions + Stack

Top technology chips, then Contribution Impact Graph, then route details. Use route nodes in Linen, Cotton, Botticelli, Tangerine and Lemon Chiffon.

### Issue Drafts

Use a dark workspace with a Sustainable Linen Markdown preview. Clearly label `Maintainer review required`.

### Profile and Safety

Use the FAQ-like safety accordion style from the reference. Toggles use Black Hole/off, Lemon Chiffon/on, and Tangerine for sensitive publishing-related controls. Include privacy, data export, clear history and reduced motion.

## 8. Motion system

- Landing hero: slow glow, arc drift, scan beam, falling code cards.
- Auth: card reveal and subtle shield orbit.
- App: page fade/slide, progress bars, route node reveal and toggle transitions.
- Findings: evidence highlight and status pulse.
- Use CSS/SVG/Web Animations before adding a library.
- Honor `prefers-reduced-motion` and provide a Profile toggle.
- Motion must never be the only signal for a state.

## 9. Component states

Every interactive component needs:

- default;
- hover;
- focus-visible;
- pressed;
- disabled;
- loading;
- success;
- error;
- empty state where applicable.

## 10. Accessibility

- Keyboard navigation across horizontal menu and accordions.
- Visible focus rings using Lemon Chiffon/Botticelli contrast.
- Labels associated with every form control.
- `aria-live` for scan progress and validation messages.
- Color is never the only severity indicator.
- Contrast must be checked for cream text on dark surfaces and dark text on Linen/Cotton.
