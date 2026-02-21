# Per4ex.org UI Design System Specification

## Overview
Dark-themed portfolio with glassmorphism effects, designed for a systems engineer aesthetic. Uses Geist fonts (Sans for headers, Mono for body), emerald accent color, and translucent card panels.

---

## 1. Color Palette

### CSS Variables (in `globals.css`)
```css
--background: #1a1a1a        /* Darker base background */
--foreground: #f0f0f0        /* Primary text color */
--sidebar: #1f1f1f          /* Sidebar background */
--sidebar-border: #333333   /* Sidebar border */
--card: rgba(45, 45, 45, 0.6) /* Translucent card background (glass effect) */
--card-border: #404040      /* Card border color */
--muted: #a3a3a3            /* Muted/secondary text */
--accent: #10b981           /* Emerald-500 - primary accent color */
```

### Tailwind Theme Configuration
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-sidebar: var(--sidebar);
  --color-sidebar-border: var(--sidebar-border);
  --color-card: var(--card);
  --color-card-border: var(--card-border);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Tailwind Classes
- `bg-background` / `text-foreground`
- `bg-sidebar` / `border-sidebar-border`
- `bg-card` / `border-card-border`
- `text-muted`
- `text-accent` / `bg-accent`

---

## 2. Typography

### Fonts (Google Fonts via Next.js)
- **Sans (Headers)**: `Geist` → `--font-geist-sans`
- **Mono (Body)**: `Geist_Mono` → `--font-geist-mono`

### Font Loading (Next.js)
```typescript
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### Font Usage
- **Body default**: `font-mono` (Geist_Mono) - applied to `body` element
- **Headers (h1-h4, strong)**: `font-sans` (Geist) - applied via CSS
- **Typewriter effect**: `font-mono`

### Typography Scale
- **Hero Title**: `text-5xl md:text-6xl` (Home page)
- **Page Title**: `text-4xl font-bold`
- **Section Title**: `text-2xl font-semibold` or `text-xl font-bold`
- **Body Large**: `text-lg md:text-xl`
- **Body**: `text-base` (default)
- **Small**: `text-sm`
- **Muted**: `text-muted` (applied to secondary text)

### CSS Typography Rules
```css
body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-mono); /* Defaulting to mono for the system engineer vibe */
}

h1, h2, h3, h4, strong {
  font-family: var(--font-sans); /* Headers in Sans for readability */
}
```

---

## 3. Layout Structure

### Root Layout
```tsx
<html lang="en">
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col md:flex-row bg-background text-foreground`}>
    <Sidebar /> {/* Fixed left sidebar, 280px wide */}
    <main className="flex-1 md:pl-[280px] w-full min-h-screen flex flex-col pt-16 md:pt-0">
      <div className="max-w-[1100px] w-full px-6 md:px-10 py-8 md:py-12 flex-1 mx-auto">
        {children}
        <Footer />
      </div>
    </main>
  </body>
</html>
```

### Key Layout Metrics
- **Sidebar Width**: `280px` (fixed, hidden on mobile)
- **Content Max Width**: `1100px` (centered)
- **Content Padding**: `px-6 md:px-10 py-8 md:py-12`
- **Mobile Top Padding**: `pt-16` (for mobile nav)
- **Sidebar Padding**: `p-8`

---

## 4. Glassmorphism Panel

### CSS Class: `.glass-panel`
```css
.glass-panel {
  @apply bg-card border border-card-border rounded-lg p-6 
         backdrop-blur-md transition-all duration-300 
         hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5;
}
```

### Usage Pattern
- Primary container for content sections
- Translucent background with blur effect
- Hover states: border accent glow, shadow
- Standard padding: `p-6`

### Variations
- **With left accent border**: `glass-panel border-l-4 border-l-accent`
- **Full height flex**: `glass-panel h-full flex flex-col justify-center`
- **Spacing inside**: `glass-panel space-y-6` or `space-y-12`
- **Hover background change**: `glass-panel hover:bg-card/80 transition-colors`

---

## 5. Component Patterns

### Sidebar Navigation
```tsx
<aside className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col p-8 z-50 overflow-y-auto hidden md:flex">
  <div className="mb-6 w-full">
    <h3 className="text-foreground font-bold text-lg mb-4">Navigate</h3>
    <nav>
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-full transition-colors duration-200",
                  isActive
                    ? "bg-card text-white"
                    : "text-muted hover:bg-card hover:text-white"
                )}
              >
                <div className={cn(
                  "relative w-6 h-6 rounded-full overflow-hidden border border-card-border transition-all duration-200",
                  isActive ? "grayscale-0" : "grayscale"
                )}>
                  <Image src={item.iconPath} alt={item.label} fill className="object-cover" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  </div>
</aside>
```

**Key Sidebar Features:**
- **Width**: `w-[280px]` fixed
- **Background**: `bg-sidebar`
- **Border**: `border-r border-sidebar-border`
- **Position**: `fixed left-0 top-0 h-screen`
- **Padding**: `p-8`
- **Nav Items**: 
  - Active: `bg-card text-white`
  - Inactive: `text-muted hover:bg-card hover:text-white`
  - Icon: `w-6 h-6 rounded-full` with grayscale filter when inactive
  - Icon border: `border border-card-border`
  - Rounded: `rounded-full` for nav items

### Cards / Glass Panels
```tsx
<div className="glass-panel">
  {/* Content */}
</div>
```

### Inline Tags/Badges
```tsx
<span className="bg-card-border px-2 py-0.5 rounded text-foreground text-base">
  MLOps
</span>
```

### Icon + Text Lists
```tsx
<ul className="space-y-4 text-muted">
  <li className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-foreground" /> 
    <strong className="text-foreground">Label</strong>
  </li>
</ul>
```

### Grid Layouts
- **2-column (responsive)**: `grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8`
- **Equal columns**: `grid grid-cols-1 md:grid-cols-2 gap-6`
- **3-column hero**: `grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4`

### Avatar/Image Circles
```tsx
<div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
  <Image src="/avatar.png" alt="Avatar" fill className="object-cover" />
</div>
```

---

## 6. Spacing System

### Standard Spacing
- **Section spacing**: `space-y-12` (between major sections)
- **Card spacing**: `space-y-6` or `space-y-4` (within cards)
- **List spacing**: `space-y-2` (nav items) or `space-y-4` (content lists)
- **Gap in grids**: `gap-8` (large), `gap-6` (medium), `gap-4` (small)

### Padding
- **Cards**: `p-6` (standard)
- **Content container**: `px-6 md:px-10 py-8 md:py-12`
- **Sidebar**: `p-8`
- **Nav items**: `px-3 py-1.5`

### Margins
- **Section margins**: `mb-6`, `mb-4`, `mb-2` (contextual)
- **Footer top margin**: `mt-12 pt-8`

---

## 7. Interactive States

### Links
```css
a {
  @apply transition-colors duration-200;
}
a:hover {
  @apply text-accent;
}
```

### Buttons (if needed)
- Hover: `hover:bg-accent/10` or `hover:text-accent`
- Transitions: `transition-colors duration-200` or `transition-all duration-300`

### Glass Panel Hover
- Border: `hover:border-accent/30`
- Shadow: `hover:shadow-lg hover:shadow-accent/5`
- Background: `hover:bg-card/80` (optional)

---

## 8. Typewriter Effect Component

### Component: `TypewriterSubtitle`
```tsx
interface TypewriterSubtitleProps {
  text: string
  speed?: number
  className?: string
  cursorColor?: string
}

export function TypewriterSubtitle({ 
  text, 
  speed = 40, 
  className, 
  cursorColor = "bg-accent" 
}: TypewriterSubtitleProps) {
  // Implementation with useState, useEffect, useRef
  // Animated blinking cursor with Framer Motion
}
```

### Usage
```tsx
<TypewriterSubtitle text="Specialized in AI-Related Ecosystems" />
```

### Styling
- Base: `text-xl md:text-2xl text-center text-muted min-h-[1.5em] font-mono`
- Cursor: Animated blinking span with accent color
- Cursor size: `w-[10px] h-[1em] ml-1 align-middle`

---

## 9. Mobile Responsiveness

### Breakpoints
- **Mobile**: Default (< 768px)
- **Tablet/Desktop**: `md:` prefix (≥ 768px)
- **Large Desktop**: `lg:` prefix (≥ 1024px)

### Mobile-Specific
- Sidebar: Hidden on mobile (`hidden md:flex`)
- Top padding: `pt-16` on mobile (for mobile nav)
- Text sizes: `text-5xl md:text-6xl` (responsive scaling)
- Padding: `px-6 md:px-10` (responsive padding)
- Layout: `flex-col md:flex-row` (stack on mobile)

### Mobile Navigation
- Separate mobile nav component (hamburger menu)
- Fixed top position on mobile
- Overlay or slide-in pattern

---

## 10. Common Patterns

### Page Structure
```tsx
<div className="space-y-8">
  {/* Breadcrumbs */}
  <nav className="text-sm text-muted mb-4">
    <span>Section</span>
    <span className="mx-2">/</span>
    <span className="text-foreground">Page</span>
  </nav>
  
  {/* Title */}
  <h1 className="text-4xl font-bold mb-2">Page Title</h1>
  <p className="text-muted">Subtitle</p>
  
  {/* Content */}
  <div className="glass-panel">
    {/* Content */}
  </div>
</div>
```

### Hero Section
```tsx
<div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
  <div />
  <div className="flex flex-col items-center">
    <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
      <Image src="/avatar.png" alt="Avatar" fill className="object-cover" />
    </div>
    <h1 className="text-5xl md:text-6xl font-bold text-center text-foreground mb-2">
      Per4ex.org
    </h1>
    <TypewriterSubtitle text="Specialized in AI-Related Ecosystems" />
  </div>
  <div />
</div>
```

### Footer
```tsx
<footer className="mt-12 pt-8 border-t border-card-border text-center text-muted text-sm pb-8">
  <p>© {new Date().getFullYear()} Systems Engineer | AI Ecosystems Specialist — Built with Next.js & Tailwind</p>
</footer>
```

---

## 11. Animation & Transitions

### Framer Motion
- Typewriter cursor: `animate={{ opacity: [0, 1, 0] }}` with infinite repeat
- Duration: `duration: 0.8`
- Page transitions: Can use `motion.div` for fade-ins

### CSS Transitions
- Standard: `transition-colors duration-200`
- Complex: `transition-all duration-300`

### Animation Patterns
- Blinking cursor: Opacity animation with infinite repeat
- Hover effects: Color and shadow transitions
- Smooth state changes: 200-300ms duration

---

## 12. Icons

### Library
- **Lucide React**: Primary icon library
- Import pattern: `import { IconName } from "lucide-react"`
- Common icons: `Bot`, `RefreshCw`, `Brain`, `BarChart`, `Search`, `Settings`, `Cpu`, `Database`, `Shield`, `Globe`, `Zap`

### Icon Sizing
- **Small**: `w-4 h-4`
- **Medium**: `w-5 h-5` (most common)
- **Large**: `w-6 h-6`
- **Extra Large**: `w-16 h-16` (for placeholders)

### Icon Colors
- Default: `text-foreground`
- Accent: `text-accent`
- Muted: `text-muted`

---

## 13. Implementation Checklist for New Project

1. ✅ Copy `globals.css` color variables and theme configuration
2. ✅ Install Geist fonts (via Next.js `next/font/google`)
3. ✅ Add `.glass-panel` utility class to CSS
4. ✅ Set up root layout structure (sidebar + main content area)
5. ✅ Configure Tailwind to use CSS variables (via `@theme inline`)
6. ✅ Implement responsive breakpoints (`md:`, `lg:`)
7. ✅ Add hover states and transitions
8. ✅ Test glassmorphism effect (backdrop-blur)
9. ✅ Verify font rendering (Sans for headers, Mono for body)
10. ✅ Match spacing and padding values
11. ✅ Install Framer Motion for animations (if using typewriter)
12. ✅ Install Lucide React for icons
13. ✅ Create reusable components (Sidebar, Footer, TypewriterSubtitle)
14. ✅ Test mobile responsiveness
15. ✅ Verify dark theme contrast and readability

---

## 14. Quick Reference

### Tailwind Classes Used
- **Colors**: `bg-background`, `text-foreground`, `bg-sidebar`, `border-sidebar-border`, `bg-card`, `border-card-border`, `text-muted`, `text-accent`, `bg-accent`
- **Typography**: `font-sans`, `font-mono`, `text-4xl`, `text-2xl`, `text-xl`, `text-lg`, `text-base`, `text-sm`, `text-muted`, `font-bold`, `font-semibold`
- **Layout**: `flex`, `grid`, `fixed`, `max-w-[1100px]`, `md:pl-[280px]`, `w-[280px]`, `h-screen`
- **Spacing**: `space-y-12`, `space-y-8`, `space-y-6`, `space-y-4`, `space-y-2`, `gap-8`, `gap-6`, `gap-4`, `p-6`, `p-8`, `px-6`, `px-10`, `py-8`, `py-12`
- **Effects**: `backdrop-blur-md`, `rounded-lg`, `rounded-full`, `transition-all duration-300`, `transition-colors duration-200`
- **Hover**: `hover:border-accent/30`, `hover:shadow-lg`, `hover:shadow-accent/5`, `hover:text-accent`, `hover:bg-card`, `hover:bg-card/80`
- **Borders**: `border`, `border-r`, `border-t`, `border-l-4`, `border-[3px]`, `border-card-border`, `border-sidebar-border`, `border-foreground`
- **Utilities**: `antialiased`, `overflow-hidden`, `overflow-y-auto`, `z-50`, `hidden md:flex`, `grayscale`, `grayscale-0`

### Key Files to Reference
- `apps/web/app/globals.css` - Color system and utilities
- `apps/web/app/layout.tsx` - Root layout structure
- `apps/web/components/sidebar.tsx` - Navigation pattern
- `apps/web/components/typewriter.tsx` - Typewriter effect
- `apps/web/components/footer.tsx` - Footer pattern
- `apps/web/app/page.tsx` - Example page structure

---

## 15. Example: Complete Page Template

```tsx
import { TypewriterSubtitle } from "@/components/typewriter"
import { Icon } from "lucide-react"

export default function ExamplePage() {
  return (
    <div className="space-y-12">
      {/* Hero/Header Section */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-2">Page Title</h1>
        <TypewriterSubtitle text="Page Subtitle" />
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="glass-panel">
          <p className="text-lg leading-relaxed text-muted mb-6">
            Main content goes here. Use <span className="bg-card-border px-2 py-0.5 rounded text-foreground text-base">inline tags</span> for emphasis.
          </p>
        </div>

        <div className="glass-panel h-full flex flex-col justify-center">
          <h3 className="text-xl font-bold text-foreground mb-6">Sidebar Content</h3>
          <ul className="space-y-4 text-muted">
            <li className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-foreground" />
              <strong className="text-foreground">Item Label</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

---

## 16. Notes for Cursor Agent

When implementing this design system in a new project:

1. **Start with colors**: Copy the CSS variables first - they're the foundation
2. **Fonts second**: Set up Geist fonts early - they affect all typography
3. **Layout structure**: Build the sidebar + main layout before adding content
4. **Glass panels**: Use `.glass-panel` class consistently for all card-like containers
5. **Spacing**: Follow the spacing scale (`space-y-12` for sections, `space-y-6` for cards)
6. **Responsive**: Always test mobile (`md:` breakpoint) - sidebar hides, layout stacks
7. **Hover states**: Add hover effects to interactive elements (links, cards, buttons)
8. **Icons**: Use Lucide React consistently, size `w-5 h-5` for most cases
9. **Typewriter**: Only use on hero/subtitle sections, not everywhere
10. **Accessibility**: Ensure contrast ratios meet WCAG standards (dark theme)

---

**End of Specification**

