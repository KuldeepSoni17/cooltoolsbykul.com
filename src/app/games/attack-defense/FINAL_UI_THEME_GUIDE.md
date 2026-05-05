# Attack-Defense Final UI Theme Guide

This guide defines the final visual system for the hosted Attack-Defense experience.

Scope:
- `/games/attack-defense/play`
- `/games/attack-defense/play/lobby`
- `/games/attack-defense/play/match/[roomId]`
- `/games/attack-defense/play/results`

## Direction Mapping Implemented

### Mobile
- Landing: **A**
- Lobby: **B**
- Match: **B**
- Results: **C**

### Desktop
- Landing: **C**
- Lobby: **A**
- Match: **D**
- Results: **B**

## Consistency Rules

### Shared core palette (mobile + desktop)
- Background base: `--ad-bg-0`, `--ad-bg-1`, `--ad-bg-2`
- Surfaces: `--ad-surface`, `--ad-surface-strong`
- Borders: `--ad-border`
- Text: `--ad-text-main`, `--ad-text-soft`
- Accent:
  - Primary: `--ad-accent-primary` (lime)
  - Secondary: `--ad-accent-secondary` (violet)
  - Tertiary: `--ad-accent-tertiary` (cyan)
  - Warning / danger: `--ad-warning`, `--ad-danger`

### Mobile consistency
- Slightly bolder contrast and stronger CTA visibility.
- Queue/action prompts remain centered and immediate.
- Card density is compact; body copy stays short.

### Desktop consistency
- Wider, structured sections and compositional layouts.
- More whitespace and stronger hierarchy for scanning.
- Desktop variants use expanded narrative blocks and timeline/map metaphors.

## Component Tokens

Defined in `play/theme.css`:
- `.ad-root`: global game background
- `.ad-container`: route max-width and base spacing
- `.ad-card` / `.ad-card-strong`: layered surfaces
- `.ad-tag`: pill metadata label
- `.ad-btn-primary`: lime CTA
- `.ad-btn-secondary`: violet CTA
- `.ad-btn-tertiary`: cyan CTA
- `.ad-btn-ghost`: neutral secondary action
- `.ad-title`: heavy display heading
- `.ad-mono`: mono utility text

## Interaction Styling Rules

- Primary user flow actions always use tokenized CTA classes.
- Disabled states use opacity and never remove borders.
- Targetable tactical cells add accent-tinted border/background.
- Status and recap sections use soft text (`--ad-text-soft`) for hierarchy.

## Future Extensions

- Add icon set replacing text-only action labels.
- Add controlled motion layer (`@keyframes`) for attack/defense outcomes.
- Add compact accessibility variant for reduced motion and higher contrast.
