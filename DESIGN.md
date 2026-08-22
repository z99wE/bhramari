# Design System: Bhramari — The Hive Mind

## 1. Visual Theme & Atmosphere

A **cockpit-density** intelligence dashboard with **offset-asymmetric** layouts. The atmosphere is electric and institutional — like a mission control room where five specialized agents operate in parallel. Dark surface, amber honeycomb geometry, cyan data streams. Motion is perpetual but restrained: soft pulses on active nodes, spring-physics card reveals, shimmer on loading states. The interface feels alive without being loud. Density: 8. Variance: 7. Motion intensity: 6.

## 2. Color Palette & Roles

- **Void Surface** (#0A0A0F) — Primary page background, infinite depth
- **Deep Charcoal** (#12121A) — Card and panel fill surfaces
- **Carbon Grid** (#1A1A2E) — Secondary elevation layers, input backgrounds
- **Honeycomb Amber** (#F59E0B) — Primary accent: CTAs, score rings, active agent states, severity-critical highlights. Saturation at 90%, never used for glows or outer shadows.
- **Data Stream Cyan** (#06B6D4) — Secondary accent: agent labels, translation output, secondary interactive states
- **Neural Purple** (#8B5CF6) — Tertiary accent: Colony tab, pattern-match badges, growth indicators
- **Ink White** (#F8FAFC) — Primary text, headlines
- **Ash Gray** (#9CA3AF) — Secondary text, metadata, labels
- **Smoke** (#6B7280) — Disabled states, empty-state copy
- **Whisper Border** (rgba(255,255,255,0.08)) — Structural card borders, 1px dividers
- **Glass Tint** (rgba(255,255,255,0.03)) — Glassmorphic card fill with backdrop blur

**Single-accent rule:** Honeycomb Amber is the dominant accent. All primary CTAs, the score ring stroke, and the logo gradient start from it. No neon outer glows. No purple-button aesthetic.

## 3. Typography Rules

- **Display / Headlines:** `Outfit` — Track-tight (-0.02em), weight-driven hierarchy. H1 at clamp(2.5rem, 5vw, 3.75rem), H2 at clamp(1.75rem, 3vw, 2.5rem). Never oversized for its own sake; weight and color carry emphasis.
- **Body:** `Outfit` — Relaxed leading (1.65), max 65ch line length, Ash Gray for secondary copy.
- **Mono / Code:** `JetBrains Mono` — For code editor, timestamps, severity labels, lineage tags. All numbers in high-density areas use mono.
- **Banned:** Inter, Times New Roman, Georgia, generic system fonts, serif fonts in dashboards.
- **Gradient text rule:** Only on the logo and the main hero headline. Never on body copy or secondary headings. The gradient flows amber → cyan → purple across a single line maximum.

## 4. Component Stylings

- **Cards (GlassCard):** Generously rounded corners (1rem / 16px). Fill at rgba(255,255,255,0.03) with backdrop-blur(20px). Border at rgba(255,255,255,0.08). On hover: border shifts to the relevant accent color at 30% opacity. Used only when elevation communicates hierarchy. In high-density zones, replace with border-top dividers.
- **Buttons (Primary CTA):** Flat fill, no outer glow. Gradient from Amber-600 to Cyan-600 for the "Summon" action. Tactile -1px translate on :active. Minimum 44px tap target. Disabled state at 40% opacity, no interaction.
- **Buttons (Secondary):** Ghost style — transparent fill, white/10 border, Ash Gray text. Hover fills to white/5.
- **Inputs / Textarea:** Carbon Grid fill, Whisper Border, no floating labels. Label sits above the input. Focus ring at Amber at 50% opacity with 3px spread. Min-height 280px for code editor. Monospace font, 13px size, 1.7 line-height.
- **Severity Badges:** Pill-shaped (full radius), filled with the severity color at 10% opacity, border at 40% opacity, text in the severity color. Critical = Red-500, High = Orange-500, Medium = Yellow-500, Low = Green-500, Info = Cyan-400.
- **Loading States:** Skeletal shimmer bars matching exact card dimensions. No circular spinners anywhere.
- **Score Ring:** SVG circle, circumference based on 10/10 scale. Stroke color maps to score tier (green ≥8, amber ≥6, orange ≥4, red <4). Glow applied via box-shadow on the container only, never on the SVG itself.
- **Agent Indicator Pills:** Small rounded containers with emoji icon, agent label, and a pulsing dot when active. Each agent has its own tinted gradient background.

## 5. Layout Principles

- **Grid-first architecture.** CSS Grid for all multi-column layouts. Max-width containment at 1280px centered.
- **Hero section is left-aligned asymmetric** — headline and subcopy occupy the left two-thirds, the code editor + stream occupy the right third on desktop. Below 768px, collapses to single column, stacked.
- **No 3-column equal-card rows.** Feature rows use 2-column zig-zag or a 2+1 asymmetric grid.
- **No overlapping elements.** Every element occupies its own spatial zone. The honeycomb SVG background sits fixed at 4% opacity behind all content — never intersecting any interactive element.
- **Navigation:** Horizontal nav bar at top with glassmorphic fill. Mobile collapses to a clean hamburger menu with full-screen overlay.
- **Section gaps:** clamp(3rem, 6vw, 5rem) vertical rhythm between major sections.
- **Use min-h-[100dvh]** for full-height sections. Never h-screen.

## 6. Motion & Interaction

- **Spring physics default:** stiffness 100, damping 20. Applied via Framer Motion to all page transitions, card entrances, and modal opens.
- **Perpetual micro-interactions:** The honeycomb background is static. Active swarm agents pulse (opacity 0.4→1.0, scale 0.98→1.02 over 2s). The logo bee icon floats continuously (translateY oscillation, 6s loop). Score ring stroke animates from 0 to final offset on mount.
- **Staggered cascade:** Finding cards enter with 50ms stagger delays. Leaderboard entries slide in with 80ms cascading delays. No list mounts instantaneously.
- **Performance:** All animations use transform and opacity only. No top/left/width/height animations. Grain or noise filters are never applied.
- **Transition speeds:** Page transitions 400ms ease-out. Card entrances 350ms cubic-bezier(0.16, 1, 0.3, 1). Micro-interactions (hover states) 150ms ease.

## 7. Anti-Patterns (Strictly Banned)

- No emojis in headings, labels, or body copy — emoji icons are restricted to decorative agent-indicator pills and the logo only
- No Inter font — Outfit is the mandatory typeface
- No pure black (#000000) — Void Surface is #0A0A0F minimum
- No neon outer glow shadows on buttons or cards — glow is reserved for the score ring container only
- No oversaturated accent colors — Amber at #F59E0B, max saturation 90%
- No excessive gradient text — gradient applies to logo and hero headline only
- No custom mouse cursors
- No overlapping content — every element in its own spatial zone
- No 3-column equal-card feature rows
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary")
- No filler UI text — no "Scroll to explore", no bouncing chevrons, no scroll arrows
- No centered hero sections — asymmetric left-aligned layout required
- No generic placeholder names — all demo users have contextual names ("hivehero", not "John Doe")
- No circular loading spinners — skeletal shimmer only
- No purple-button aesthetics or blue-neon gradients on interactive elements
