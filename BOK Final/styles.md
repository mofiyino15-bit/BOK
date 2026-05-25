# BOK — Design System & Styles Reference
**Heritage:** Scandinavian — clean, minimal, functional, generous whitespace
**Framework:** Tailwind CSS v4 + shadcn/ui CSS variables
**Fonts:** Barlow Semi Condensed (primary), Afacad (secondary)

---

## Typography

### Font Families
```
Primary:   "Barlow Semi Condensed"
Secondary: "Afacad"
Base size: 16px (set via --font-size CSS var)
```

### Type Scale

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| Heading 5XL | 64px | 88px | -1px | Hero |
| Heading 4XL | 56px | 80px | -1px | Page hero |
| Heading 3XL | 48px | 72px | -1px | Section hero |
| Heading 2XL | 40px | 56px | -1px | Large heading |
| Heading XL  | 32px | 48px | -0.5px | Page title |
| Heading L   | 28px | 40px | -0.5px | Card title |
| Heading M   | 24px | 32px | -0.5px | Sub-heading |
| Heading S   | 20px | 28px | -0.5px | Label heading |
| Text XL     | 20px | 28px | 0 | Large body |
| Text L      | 18px | 24px | 0 | Body |
| Text M      | 16px | 24px | 0 | Default body |
| Text S      | 14px | 20px | 0 | Small / table |
| Text XS     | 12px | 16px | 0 | Caption / badge |

### Font Weights
```
Regular:   400
Medium:    500
Semi Bold: 600
```

### Mobile Type Scale (breakpoint 393px)
Headings scale down one step (e.g. 5XL → 56px, 4XL → 48px, etc.)

---

## Color System

### Primitive Colors

#### Blue (Brand)
```
blue-brand-50:  #F0F9FF  ← Hover / tint surface
blue-brand-100: #E0F2FE
blue-brand-200: #BAE6FD
blue-brand-300: #7DD3FC
blue-brand-400: #38BDF8
blue-brand-500: #0EA5E9  ← Primary brand (4.6:1 on white, WCAG AA ✅)
blue-brand-600: #0284C7  ← Hover state
blue-brand-700: #0369A1
blue-brand-800: #075985
blue-brand-900: #0C4A6E
```

#### Grey (Neutral)
```
grey-25:  #F8F8F8  ← Page background
grey-50:  #F2F2F2
grey-100: #E3E4E6
grey-200: #C6C9CE
grey-300: #AAADB5
grey-400: #8D929D
grey-500: #717784
grey-600: #5A5F6A
grey-700: #44474F
grey-800: #2D3035
grey-900: #17181A  ← Primary text
```

#### Status Colors
```
Green (Positive/Paid):
  green-100: #D2F3E1
  green-500: #1FC16B
  green-600: #199A56

Red (Negative/Overdue):
  red-100:   #FED7DA
  red-500:   #FB3748
  red-600:   #C92C3A

Amber (Warning/Notice):
  amber-100: #FEF9C3
  amber-500: #EAB308
  amber-600: #CA8A04

Yellow:
  yellow-100: #FDF0D2
  yellow-500: #F6B51E

Blue (Info/Upcoming):
  blue-100: #D6DEFF
  blue-500: #335CFF
  blue-600: #294ACC

Purple:
  purple-100: #E5DCFD
  purple-500: #7D52F4

Primary:
  Black:    #000000
  White:    #FFFFFF
```

### Semantic Colors (Light Mode)

#### Content
```
content-primary:         #17181A
content-secondary:       #2D3035
content-tertiary:        #5A5F6A
content-primary-inverse: #FFFFFF
content-disabled:        #AAADB5
content-brand:           #0EA5E9
content-link:            #0284C7
content-notice:          #EAB308  ← amber yellow (warning), not brand orange
content-negative:        #FB3748
content-positive:        #1FC16B
```

#### Background
```
bg-primary:          #F8F8F8
bg-secondary:        #FFFFFF
bg-hover:            #F8F8F8
bg-pressed:          #F2F2F2
bg-selected:         #D0DDD5
bg-brand:            #0EA5E9
bg-info-subtle:      #F0F9FF
bg-notice-subtle:    #FEF9C3
bg-negative-subtle:  #FED7DA
bg-positive-subtle:  #D2F3E1
```

#### Border
```
border-primary:   #5A5F6A
border-secondary: #8D929D
border-disabled:  #C6C9CE
border-brand:     #0EA5E9
border-focus:     #0EA5E9
border-negative:  #FB3748
border-notice:    #EAB308
border-positive:  #1FC16B
```

### shadcn/ui CSS Variables (as used in theme.css)
```css
--background:        #ffffff
--foreground:        oklch(0.145 0 0)   /* ~#17181A */
--card:              #ffffff
--primary:           #030213
--muted:             #ececf0
--muted-foreground:  #717182
--accent:            #e9ebef
--border:            rgba(0, 0, 0, 0.1)
--input-background:  #f3f3f5
--destructive:       #d4183d
--radius:            0.625rem           /* 10px */
```

---

## Spacing Scale

| Token | Value | Tailwind equiv |
|-------|-------|----------------|
| 2XS | 2px  | — |
| XS  | 4px  | p-1 |
| S   | 8px  | p-2 |
| M   | 12px | p-3 |
| L   | 16px | p-4 |
| XL  | 24px | p-6 |
| 2XL | 32px | p-8 |
| 3XL | 40px | p-10 |
| 4XL | 48px | p-12 |
| 5XL | 56px | — |
| 6XL | 64px | p-16 |
| 7XL | 72px | — |
| 8XL | 80px | p-20 |
| 9XL | 88px | — |
| 10XL| 96px | p-24 |
| 11XL| 104px | — |
| 12XL| 112px | p-28 |

---

## Border Radius

| Token  | Value | Usage |
|--------|-------|-------|
| Circle | 50px  | Avatars, circle icons |
| Pill   | 999px | Status badges, filter chips |
| XL     | 32px  | Large modals |
| L      | 16px  | Cards, panels |
| M      | 12px  | Cards (standard: `rounded-xl` = 12px) |
| S      | 8px   | Buttons, inputs (`rounded-lg`) |
| XS     | 4px   | Small elements (`rounded`) |

---

## Border Width

| Token | Value |
|-------|-------|
| S     | 1px   |
| M     | 1.5px |
| L     | 2px   |
| XL    | 4px   |
| Pill  | 8px   |

---

## Breakpoints

| Token | Width |
|-------|-------|
| S (Mobile) | 393px |
| M (Tablet) | 768px |
| L (Desktop) | 1024px |
| XL (Wide) | 1440px |

---

## Component Patterns (As Built)

### Cards
```
bg-white rounded-xl border-[0.5px] border-border
padding: p-6 (standard), p-3 (compact dashboard widgets)
```

### Sidebar
```
w-[220px] h-screen bg-white flex flex-col p-4
border-r border-border
```

### Navigation Items
```
Default:  text-slate-600 hover:bg-slate-100 rounded-lg
Active:   bg-blue-500 text-white rounded-lg
Padding:  px-4 py-3
Gap:      gap-3 (icon + label)
```

### Buttons
```
Primary:  bg-blue-500 text-white rounded-lg hover:bg-blue-600 px-5 py-2.5
Outlined: border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50
Ghost:    text-slate-700 hover:bg-white rounded-lg
Danger:   bg-red-500 text-white
Icon:     p-1.5 hover:bg-slate-200 rounded
```

### Status Badges
```
Base:     px-3 py-1 rounded-full text-xs font-medium

Draft:    bg-slate-100 text-slate-700
Upcoming: bg-blue-100 text-blue-700
Due Today: bg-amber-100 text-amber-700  (yellow: #FEF9C3 / #A16207)
Overdue:  bg-red-100 text-red-700
Paid:     bg-green-100 text-green-700

Client risk:
Reliable:   bg-green-100 text-green-700
Slow Payer: bg-amber-100 text-amber-700  (yellow: #FEF9C3 / #A16207)
At Risk:    bg-red-100 text-red-700
```

### Tables
```
Header:     bg-slate-50, text-sm font-semibold text-slate-700, py-4 px-6
Row even:   bg-white
Row odd:    bg-slate-50/30
Row hover:  hover:bg-slate-50
Divider:    border-b border-slate-100
Cell text:  text-sm text-slate-700 py-4 px-6
```

### Form Inputs
```
input/select/textarea:
  border border-slate-300 rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500
  px-4 py-2.5
```

### Custom Dropdowns (Filter pattern)
```
Trigger (default): flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50
Trigger (active):  bg-blue-500 text-white border-blue-500

Menu: absolute top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10
Item: w-full text-left px-4 py-2 text-sm hover:bg-slate-50
```

### Tabs (Client Detail pattern)
```
Container: border-b border-slate-200
Tab default:  pb-3 px-1 text-sm font-medium border-b-2 border-transparent text-slate-600
Tab active:   border-blue-500 text-blue-600
```

### Modal Overlay
```
fixed inset-0 bg-black/50 flex items-center justify-center z-50
Content: bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col
```

### Page Layout
```
Main content area: flex-1 bg-slate-50 overflow-auto px-10 py-4
Grid system: grid grid-cols-12 gap-4 (or gap-6)
```

---

## Icon Library

**Package:** lucide-react@0.487.0
**Default size:** 20px (nav), 16px (inline), 18px (search), 24px (KPI cards)
**Stroke:** default (1.5)

---

## shadcn/ui Components Available

Full library installed and available in `/src/ui/`:
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb,
button, calendar, card, carousel, chart (Recharts wrapper), checkbox,
collapsible, command, context-menu, dialog, drawer, dropdown-menu,
form (react-hook-form), hover-card, input, input-otp, label, menubar,
navigation-menu, pagination, popover, progress, radio-group, resizable,
scroll-area, select, separator, sheet, sidebar, skeleton, slider,
sonner (toasts), switch, table, tabs, textarea, toggle, toggle-group, tooltip

**Note:** Most UI in Bok is currently built with raw HTML + Tailwind rather than
shadcn components — custom dropdowns, tables, and badges are hand-built for
tighter visual control.

---

## Design Principles (Scandinavian Heritage)

1. **Form follows function** — every element earns its place
2. **Generous whitespace** — breathing room between sections
3. **Typographic clarity** — Barlow Semi Condensed gives a Nordic, condensed efficiency
4. **Muted palette with purposeful accent** — sky blue brand (#0EA5E9), amber yellow for warning, semantic colours only for status
5. **No decorative elements** — no gradients, no drop shadows except `shadow-lg` on modals
6. **Subtle borders** — `border-[0.5px]` on cards keeps structure without weight
7. **Data first** — tables and numbers are the hero, not illustrations
