# Reference UI Analysis — ContribLens Landing Page

## Source material reviewed

- Screen recording: `.opencode/omnirush/inbox/chat-attachments/ses_eafecc381ffeZnXZamXyM9ha2q/6f8fe7e0-ef1c-42fb-803d-20b2fb52b2db-Screen Recording 2026-10-24 144017.mp4`
- Visual reference image: `.opencode/omnirush/inbox/chat-attachments/ses_eafecc381ffeZnXZamXyM9ha2q/d314d722-577c-4456-808b-1d1b28f1fd26-1000054152.jpg`

## Observed problems

### Landing page

1. The hero is clean but feels static and under-designed: a large text block sits beside one dark product card without enough visual storytelling or interaction.
2. The page is dominated by flat black space. There is not enough controlled depth, atmospheric light, material contrast or movement to make the first viewport feel memorable.
3. The public header is a mostly opaque dark strip. It does not have the requested liquid-glass treatment: no meaningful backdrop blur, translucent surface, inner highlight, glass border or layered depth.
4. The navigation labels are small and low-contrast. The header has weak active, hover and scroll-state feedback.
5. The small floating labels around the hero card look like implementation/debug annotations rather than intentional product UI. They are easy to miss, partially overlap and do not guide the eye.
6. The four-step workflow under the hero is too small to read at normal viewing distance. It does not visually communicate progress or connect clearly to the product preview.
7. The primary and secondary CTAs look like generic pills. Their hierarchy is present but not memorable, and the secondary action does not create a strong visual transition into the product story.
8. The hero preview is mostly static. It does not make the scan → verify → explain → contribute journey feel alive.
9. The FAQ section in the recording uses flat dark accordion blocks with limited depth and little relationship to the visual language of the hero.
10. The lower call-to-action section appears abruptly after large black areas and does not feel like a strong conclusion to the story.

### Authenticated shell visible in the recording

1. The authenticated top navigation is functional but flat. It needs the same material language as the public header so the application feels like one product.
2. Dashboard cards use a repeated dark-card pattern but lack enough hierarchy between primary metrics, next action and supporting context.
3. Empty states are very quiet. They need a more attractive but still professional visual cue and a clear next action.
4. Contribution readiness, evidence and scan progress should be visually connected rather than appearing as unrelated cards.

## Visual direction from the reference image

The reference image uses a strong editorial composition:

- warm Mocha Brown;
- cool Platinum Silver;
- soft Pale Lavender;
- a warm neutral background;
- one memorable metallic/liquid chrome object;
- restrained typography over a calm surface;
- one clear accent color rather than many competing accents.

Use the reference as visual direction, not as a literal copy. Do not copy Instagram UI, creator names, image content, logos or proprietary assets.

## Approved supporting color tokens from the reference

```text
Mocha Brown:     #6F4E37
Platinum Silver: #E5E4E2
Pale Lavender:   #E6E0F0
```

Use these as supporting materials alongside the existing ContribLens brand system:

```text
Pure Black:          #000000
Black Hole:          #222222
Sustainable Linen:  #FAF3E1
Recycled Cotton:    #F5E7C6
Electric Tangerine: #FF6D1F
Lemon Chiffon:      #FFF8CA
Rosewood:           #6B0B0C
Coffee Bean:        #2D120D
Botticelli:         #CDE3E8

Reference support:
Mocha Brown:        #6F4E37
Platinum Silver:    #E5E4E2
Pale Lavender:      #E6E0F0
```

The base brand remains black/Black Hole with Electric Tangerine as the primary action accent. Mocha Brown, Platinum Silver and Pale Lavender are supporting surfaces, reflections, data states and editorial accents. Do not reintroduce neon lime, the old indigo palette or the old mint palette.

## Required outcome

The redesign must feel:

- clean;
- premium;
- modern;
- professional;
- student-friendly;
- evidence-focused;
- visually memorable without being noisy;
- fast on mobile;
- fully functional, not a static mockup.

The most important missing request to implement is a real liquid-glass treatment for the public header, feature/menu bar, authenticated header and major feature panels.
