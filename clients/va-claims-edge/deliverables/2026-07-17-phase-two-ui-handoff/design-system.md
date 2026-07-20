# VA Claims Edge product design system

## Design read

A trust-first regulated claims product UI for claimants and operators, preserving the approved VA Claims brand, using a restrained token system and accessible product patterns.

- Design variance: 4 of 10
- Motion intensity: 3 of 10
- Visual density: 6 of 10

## Principles

1. Make status and next actions easier to understand than the software around them.
2. Use dark navy and ink for the locked product theme, ivory for the logo plaque, red for primary brand actions, and cyan only for focus and informational accents.
3. Reserve red status language for action or risk. Never rely on color alone.
4. Keep operational screens dense enough for daily work, with a minimum 44 pixel interactive target.
5. Show loading, empty, and error conditions explicitly. Never substitute invented numbers.

## Locked foundations

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--vace-ink-950` | `#070B18` | darkest navigation and backdrop |
| `--vace-ink-900` | `#0B1124` | application background |
| `--vace-ink-850` | `#10182D` | intermediate dark surface |
| `--vace-ink-800` | `#151E35` | elevated dark surface |
| `--vace-navy` | `#323763` | primary brand structure |
| `--vace-red` | `#A83232` | primary action and urgent emphasis |
| `--vace-red-hover` | `#B63A3A` | action hover |
| `--vace-ivory` | `#F7F5EF` | warm light surface |
| `--vace-cyan` | `#61D8D0` | focus and information accent |
| `--vace-cyan-muted` | `#2AA9A2` | restrained cyan treatment |
| `--vace-text` | `#EEF2F8` | primary dark-surface text |
| `--vace-muted` | `#A5AFC2` | secondary dark-surface text |
| `--vace-muted-2` | `#8996AE` | tertiary dark-surface text |
| `--vace-success` | `#71D6A6` | success status |
| `--vace-warning` | `#EFBC62` | warning status |
| `--vace-danger` | `#FF9A9E` | error status |
| `--vace-focus` | `#61D8D0` | keyboard focus ring |

### Typography

Epilogue remains the approved display and interface family. The CSS falls back to system sans serif so the application remains readable if web fonts are unavailable. Headings use compact tracking; body and table content use normal tracking. Body copy never drops below 14 pixels in the application.

### Spacing

The base unit is 4 pixels. Supported steps are 4, 8, 12, 16, 20, 24, 32, 40, 48, and 64 pixels. Product panels use 16 to 24 pixel internal spacing. Page gutters are 16 pixels on mobile and 24 to 32 pixels on larger screens.

### Shape and elevation

Interactive controls use a full pill radius. Cards use 16 pixel radii. The approved logo plaque keeps its clipped top edge and rounded lower edge. Large login composition panels use a 24 to 30 pixel radius. Shadows are restrained and always paired with a visible border.

### Motion

Motion uses a 160 to 240 millisecond ease-out for state changes. No continuous decorative animation is permitted. `prefers-reduced-motion` reduces all transitions and animation to effectively zero.

## Components

- Buttons: primary red, secondary bordered, tertiary text. Disabled and pending states must remain readable.
- Inputs: persistent labels, visible focus ring, inline error text connected by `aria-describedby`.
- Status badges: pair text with color. Supported tones are neutral, info, success, warning, and danger.
- Summary cards: label, value, context, and optional trend. Values must come from live data or be labeled sample.
- Table: real header cells, row scope, keyboard-visible linked names, responsive horizontal scroll.
- Pipeline: columns name the stage and count. Cards contain only the minimum identifying operational metadata.
- Navigation: current location uses both contrast and `aria-current="page"`.
- Session controls: sign out calls the existing Supabase client by default, supports an application-provided override, shows a pending label, and renders a recoverable inline error.

## State contract

Every data-backed page must render four states: loading, ready, empty, and error. Error messaging explains the failed action and offers retry when safe. Empty messaging explains what will appear and the next legitimate step.

## Accessibility and content

- Target WCAG 2.2 AA contrast.
- Use semantic headings in order and one page-level `h1`.
- Provide a skip link and visible keyboard focus.
- Do not communicate state with color alone.
- Avoid real claimant names or health information in fixtures, screenshots, or review builds.
- Avoid dash-style punctuation in visible interface copy.
