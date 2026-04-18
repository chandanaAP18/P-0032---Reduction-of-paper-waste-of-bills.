# Smart Billing — Design System

## Visual Identity Overview

Smart Billing's design system reflects an **eco-friendly, digital-first approach** with a modern, accessible interface that prioritizes user experience and environmental consciousness.

---

## 🎨 Color Palette

### Primary Colors (Eco-Friendly)
- **Primary-600**: `#10b981` — Rich emerald green (primary action color)
- **Primary-500**: `#14b8a6` — Teal-green (complementary)
- **Primary-400**: `#34d399` — Fresh mint green (hover states)
- **Primary-300**: `#6ee7b7` — Light mint (accents)
- **Primary-50**: `#ecfdf5` — Near-white green tint (backgrounds)

**Usage**: Primary colors communicate eco-friendliness, growth, and sustainability.

### Secondary Colors (Digital Foundations)
- **Secondary-900**: `#0f172a` — Deep navy (main background)
- **Secondary-800**: `#1e293b` — Dark slate (containers)
- **Secondary-700**: `#334155` — Medium slate (borders, dividers)
- **Secondary-600**: `#475569` — Light slate (secondary text)
- **Secondary-400**: `#cbd5e1` — Light gray (primary text on dark)
- **Secondary-300**: `#e2e8f0` — Lighter gray (body text)
- **Secondary-200**: `#f1f5f9` — Near-white (light backgrounds)
- **Secondary-50**: `#f8fafc` — Off-white (highest contrast)

**Usage**: Secondary colors provide structure, contrast, and digital-first aesthetics.

### Accent Colors
- **Success**: `#22c55e` — Bright green (confirmations, positive actions)
- **Warning**: `#eab308` — Amber (alerts, cautions)
- **Error**: `#ef4444` — Red (errors, destructive actions)
- **Info**: `#06b6d4` — Cyan (informational content)

---

## 🔤 Typography System

### Font Families
- **Display Font**: "Plus Jakarta Sans" (fallback: system sans-serif)
  - Used for: Headings (h1, h2), brand names, emphasis
  - Weight: 800 (bold), letter-spacing: -0.02em
  - Purpose: Modern, friendly, distinctive

- **Body Font**: "Inter" (fallback: system sans-serif)
  - Used for: Body text, navigation, buttons
  - Weight: 400 (regular), 600 (semibold), 700 (bold)
  - Purpose: Clear, readable, professional

### Type Scale
- **h1**: `clamp(2.5rem, 4vw, 4.2rem)` — Responsive headline
  - Line-height: 1.02
  - Letter-spacing: -0.02em
  
- **h2**: `1.75rem` — Section headings
  - Font-weight: 800
  - Letter-spacing: -0.01em

- **Body**: `1rem` — Standard body text
  - Line-height: 1.8
  - Font-weight: 400

- **Lead**: `1.05rem` — Introductory text
  - Line-height: 1.75
  - Color: Secondary-300

- **Label**: `0.9rem` — Form labels, captions
  - Font-weight: 600

---

## 🎯 Logo Design

### Logo Concept
The Smart Billing logo combines two core ideas:
1. **Document/Bill**: Represents invoicing and billing functionality
2. **Leaf**: Symbolizes eco-friendliness and sustainability

### Logo Construction
- **Document shape**: Rounded rectangle with subtle lines (billing concept)
- **Leaf accent**: Organic leaf shape integrated into the design
- **Color**: Linear gradient from Primary-500 to Primary-600
- **Size**: Scales responsively (40x40px in header, adaptable)

### Logo Accessibility
- Uses `currentColor` for icon color inheritance
- Includes stroke and opacity variations for depth
- Works in dark mode contexts

---

## 📐 Spacing System

All spacing follows a base unit of 4px:
- **xs**: 8px — Tight spacing (gaps within components)
- **sm**: 12px — Small spacing (button padding, icon gaps)
- **md**: 16px — Standard spacing (sections, component padding)
- **lg**: 24px — Large spacing (major sections, headers)
- **xl**: 32px — Extra large (main padding, section spacing)
- **2xl**: 48px — Maximum spacing (page-level padding)

---

## 🔲 Border Radius System

- **sm**: 8px — Slightly rounded (input fields, badges)
- **md**: 12px — Standard rounded (buttons, cards)
- **lg**: 16px — Soft rounded (section cards)
- **xl**: 24px — Generous rounded (large containers)
- **full**: 999px — Pill-shaped (buttons, badges)

---

## ✨ Component Styling

### Buttons
**Primary Button (.button)**
- Background: Linear gradient (Primary-500 → Primary-600)
- Color: Secondary-50 (white text)
- Padding: 14px 28px
- Border-radius: Full (999px)
- Shadow: `0 4px 15px rgba(16, 185, 129, 0.2)`
- Hover: Translate Y(-2px), shadow increase
- Weight: 700, letter-spacing: -0.01em

**Secondary Button (.button-secondary)**
- Background: `rgba(16, 185, 129, 0.12)` (light green tint)
- Color: Primary-300 (light mint text)
- Border: 1.5px solid `rgba(16, 185, 129, 0.3)`
- Hover: Background opacity increase, border strengthen

### Cards (.section-card)
- Background: `rgba(30, 41, 59, 0.5)` with backdrop blur
- Border: 1px solid `rgba(16, 185, 129, 0.12)`
- Padding: 32px (lg)
- Border-radius: 24px (xl)
- Hover: Border color and background opacity increase
- Heading color: Primary-300 (mint green)

### Navigation Links
- Color: Secondary-400 (light gray)
- Hover: Primary-400 (mint green)
- Transition: 0.2s ease
- Font-weight: 600
- Font-size: 0.95rem

---

## 🎬 Motion & Transitions

- Standard transition: `0.2s ease`
- Button hover: Transform Y-axis, shadow enhancement
- Card hover: Border and background updates
- Smooth scrolling: `scroll-behavior: smooth`

### Reduced Motion Support
Pages include `prefers-reduced-motion` media query to respect user preferences and accessibility needs.

---

## 🌍 Eco-Friendly Design Philosophy

1. **Minimal, purposeful design** — Reduces cognitive load and digital footprint
2. **Dark mode by default** — Lower energy consumption on OLED/modern screens
3. **Sustainable color palette** — Green tones reinforce environmental values
4. **Efficient animations** — Smooth, purposeful motion without excess
5. **Accessible contrast** — High contrast ratios support all users, including those with color blindness

---

## 📱 Responsive Design

- Base breakpoint: 720px (mobile-friendly layout)
- Flexible typography using `clamp()` for scale
- Touch-friendly button sizes (min 44x44px)
- Flexible spacing that adapts to viewport

---

## 🛠️ CSS Custom Properties (Variables)

All styles use CSS custom properties for maintainability:
```css
--color-primary-600: #10b981;
--font-family-display: "Plus Jakarta Sans", system-ui, ...;
--spacing-lg: 24px;
--radius-full: 999px;
```

This ensures consistent application across all components and simplifies future theme updates.

---

## Implementation Notes

The Smart Billing design system is implemented in `index.html` using:
- CSS custom properties for theming
- Semantic HTML for accessibility
- Dark mode as the primary color scheme
- Eco-friendly green palette for primary actions
- Modern, professional typography
- Responsive, motion-aware animations

All colors, spacing, and typography are accessible and follow WCAG 2.1 AA standards.
