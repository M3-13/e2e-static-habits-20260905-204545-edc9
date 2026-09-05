# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Ruhige Produktivitäts-App im Linear/Stripe-Stil: warmes Off-White im hellen und tiefes Blaugrau im dunklen Modus, ein einziges Smaragdgrün als Erfolgsakzent, System-Font-Stack für native Lesbarkeit.

## Colors

- `--color-bg`: **#F7F8F7**
- `--color-surface`: **#FFFFFF**
- `--color-fg`: **#1A1D21**
- `--color-muted`: **#667085**
- `--color-border`: **#E4E7EC**
- `--color-accent`: **#10B981**
- `--color-accent_hover`: **#0EA371**
- `--color-accent_soft`: **#E7F7F1**
- `--color-danger`: **#DC2626**
- `--color-danger_soft`: **#FDECEC**
- `--color-bg_dark`: **#101316**
- `--color-surface_dark`: **#171C21**
- `--color-fg_dark`: **#E8EAED**
- `--color-muted_dark`: **#9AA3AD**
- `--color-border_dark`: **#2A3138**
- `--color-accent_dark`: **#34D399**
- `--color-accent_dark_hover`: **#6EE7B7**
- `--color-accent_soft_dark`: **#14332A**
- `--color-danger_dark`: **#F87171**
- `--color-danger_soft_dark`: **#3A1D1D**

## Typography

- `font_family`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
- `heading_weight`: 600
- `body_weight`: 400
- `size_scale`: 12px / 14px / 15px / 18px / 22px / 28px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primär: min-height 44px, padding 12px 24px, radius md (10px), bg=accent, color=#FFFFFF, font-weight 600, font-size 15px; hover bg=accent_hover; active bg um 5% dunkler + translateY(1px); disabled opacity 0.55, cursor not-allowed; focus-visible 2px outline in accent mit 2px offset. Ghost/Sekundär: bg=transparent, border 1px solid border, color=fg; hover bg=muted bei 8% Deckkraft. Danger: bg=danger, color=#FFFFFF, hover bg um 5% dunkler.

### Card

bg=surface, border 1px solid border, radius lg (16px), padding 16px (mobil) / 24px (desktop), box-shadow 0 1px 2px rgba(16,24,40,0.05); bei klickbaren Karten hover shadow 0 4px 12px rgba(16,24,40,0.08).

### TextInput

min-height 44px, padding 10px 12px, radius md (10px), bg=surface, color=fg, border 1px solid border, placeholder=muted, font-size 15px; focus border=accent + box-shadow 0 0 0 3px accent bei 18% Deckkraft; invalid border=danger.

### IconButton

44x44px (Touch-Target), radius md (10px), bg=transparent, color=muted; hover bg=muted bei 10% Deckkraft und color=fg; active 15%; focus-visible 2px outline in accent; immer aria-label setzen.

### FilterPill

min-height 36px, padding 8px 16px, radius pill, font-size 14px, border 1px solid border; inaktiv bg=surface, color=muted; aktiv bg=fg, color=bg, border=fg; hover bei inaktiv border=muted; focus-visible outline in accent.

### Modal

Overlay rgba(10,12,16,0.55), zentriert, z-index 50; Dialog max-width 400px, bg=surface, radius lg (16px), padding 24px, border 1px solid border; Titel 18px/600; Schließen per Escape und Klick auf Overlay; Fokus wird beim Öffnen in den Dialog gesetzt.

### StatChip

padding 4px 10px, radius pill, bg=accent_soft, color=accent_hover (hell) bzw. accent_dark (dark), font-size 12px, font-weight 600, min-height 24px, white-space nowrap; für aktuelle Serie, längste Serie und Wochenquote.

### DayGrid

CSS-Grid mit grid-template-columns: repeat(auto-fit, minmax(26px, 1fr)), gap 6px; Zellen quadratisch, radius sm (6px), border 1px solid border, bg=surface; erledigt bg=accent und border=accent, Häkchen als 2px-Strich/SVG in #FFFFFF; heute zusätzlich 2px outline in accent mit 2px Abstand; hover bei nicht erledigt border=muted; focus-visible outline in accent; Mobile bricht in mehrere Reihen um, kein horizontales Scrollen.

### ChartCanvas

Höhe 120px, Breite 100% der Karte, devicePixelRatio wird berücksichtigt; Balkenfarbe=accent, Hintergrundraster=muted bei 15% Deckkraft; Balkenbreite mindestens 8px, Abstand 4px, radius 3px an oberen Ecken; Wochenlabels 11px in muted unterhalb; 100%-Zielwert als dezente gestrichelte Linie in muted.

### DarkModeToggle

Klickfläche 44x44px; Switch-Track 44x24px, Thumb 20px, radius pill; aus bg=muted bei 35% Deckkraft, an bg=accent; Thumb bg=#FFFFFF mit dezenter box-shadow; focus-visible outline in accent; Zustand wird in LocalStorage gespeichert.

### EmptyState

Zentriert, max-width 420px, padding 48px 16px; Icon-Kreis 64px mit bg=accent_soft und accent-Häkchen; Titel 20px/600, Text 15px in muted, Abstand 16px; primärer Button 'Erste Gewohnheit anlegen'.

### Banner

role=alert, padding 12px 16px, radius md (10px), border 1px solid danger, bg=danger_soft, color=danger (hell) bzw. danger_dark (dark), font-size 14px; mit Warn-Icon und IconButton zum Schließen; für Import- und Validierungsfehler.

## Layout Principles

- Container max-width 880px, margin 0 auto, padding 16px (mobil) / 24px (desktop); kein horizontales Scrollen.
- Breakpoints: <640px kompakt einspaltig, 640–1024px Tablet mit größeren Abständen, ≥1024px Desktop.
- Sticky App-Header mit Titel, Filter-Pills und Dark-Mode-Toggle; Höhe 64px mobil, 72px desktop.
- Abstände: 24px zwischen Karten, 16px zwischen Elementen innerhalb einer Karte, 48px zwischen Header/Liste/Footer.
- 30-Tage-Raster und Acht-Wochen-Chart liegen innerhalb der Karte untereinander; Statistiken (aktuelle Serie, längste Serie, Wochenquote) als StatChips in einer Zeile, auf Mobile umbrechend.
- Leerer Zustand und Fehlermeldungen erscheinen ohne Layout-Sprung an derselben zentralen Position wie die Liste.
