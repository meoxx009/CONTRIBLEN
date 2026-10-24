# ContribShield OSS — Design System & Visual Specification

## 1. Visual Identity & Brand Concept

ContribShield is an English-first, evidence-first security and contribution navigator. Its visual system deliberately avoids the generic SaaS indigo/mint palette in favor of an authentic, high-contrast, security-command palette:

| Token Name | Hex Code | Semantic Role |
|---|---|---|
| **Black Hole** | `#08090C` | Cosmic deep background, main canvas backdrop |
| **Coffee Bean** | `#1A1412` | Warm dark elevated card and panel background |
| **Electric Tangerine** | `#FF6B35` | High-energy primary action, focus rings, active badges |
| **Lemon Chiffon** | `#FFF1C5` | Warm highlight, warning accents, readiness markers |
| **Rosewood** | `#7A161D` | Deep crimson for critical vulnerabilities and alert banners |
| **Botticelli** | `#8EA4B5` | Slate-blue/gray for borders, secondary copy, muted badges |
| **Linen** | `#F7EFE4` | Soft warm body text, secondary labels, high readability |
| **Cotton** | `#FFFFFF` | Pure white for headers, metrics, high-emphasis titles |

## 2. Navigation Architecture

- **Public Navigation**:
  `ContribShield | Process | Features | Safety | FAQs | Login | Sign up`
- **Authenticated Navigation**:
  `ContribShield | Dashboard | Scan Repository | Findings | Contributions + Stack | Issue Drafts | Profile`
- **Rule**: The authenticated navigation is strictly **horizontal, sticky, and responsive**. On small viewports, it flows as an accessible, smooth horizontal scroll rather than converting into a vertical sidebar.

## 3. Component States

Every network-backed view must explicitly support:
1. **Empty State**: Clear guidance, relevant CTA, no broken layouts.
2. **Loading State**: Subtle animated spinners or skeleton loaders honoring `prefers-reduced-motion`.
3. **Error State**: Explicit, constructive error messages in professional English.
4. **Success State**: Clear, high-contrast feedback with toast notifications.

## 4. Typography & Accessibility

- **Font Scale**: Responsive standard scale with user-selectable mode in Profile (Compact, Standard, Enlarged).
- **Font Stack**: Sans-serif (Inter / System) with Monospace accents for evidence, file paths, and rule IDs.
- **Motion**: Soft CSS transitions; complete disablement when `prefers-reduced-motion` is active.
