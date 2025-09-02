# Libra UI Design System

> Modern, scalable React component library and design system

Libra UI is an enterprise-grade design system built on **Tailwind CSS v4** and **Radix UI**, providing consistent, beautiful, and powerful user interface solutions for modern web applications. The system leverages the `radix-ui` package for headless component primitives and includes **47+ carefully designed components**, covering a complete UI ecosystem from basic elements to complex interactions.

## 🚀 Core Features

### 🎨 Modern Design Language
- **Tailwind CSS v4 Integration**: Adopts the latest CSS-in-CSS syntax and utility class system
- **Semantic Color System**: Scientific color scheme based on OKLCH color space
- **Dynamic Theme Switching**: Complete light/dark mode support with smooth transition animations
- **Brand Customization**: Flexible brand color and visual style configuration

### 🧩 Component Architecture
- **Atomic Design**: Follows atomic design principles, from basic atoms to complex templates
- **Composable API**: Supports flexible component composition and nested usage
- **Variant System**: Uses CVA (Class Variance Authority) for type-safe style variants
- **Slot Pattern**: Enables flexible component replacement and extension through `asChild` prop

### ♿ Accessibility First
- **WCAG 2.1 AA Standards**: All components comply with international accessibility standards
- **Keyboard Navigation**: Complete keyboard operation support, including focus management and shortcuts
- **Screen Reader**: Semantic HTML structure and ARIA attribute support
- **High Contrast Mode**: Automatically adapts to system high contrast settings

### 📱 Responsive Design
- **Mobile First**: Adopts mobile-first design and development strategy
- **Breakpoint System**: Flexible responsive breakpoint configuration
- **Adaptive Components**: Components automatically adapt to different screen sizes and device types
- **Touch Friendly**: Optimized touch interaction experience

### 🛠️ Developer Experience
- **TypeScript Support**: Complete type definitions and intelligent hints
- **Tree Shaking**: On-demand imports, optimized bundle size
- **Development Tools**: Rich development assistance tools and debugging features
- **Comprehensive Documentation**: Detailed API documentation and usage examples

## 📁 Project Structure

```text
packages/ui/                    # UI package root directory
├── src/                        # Source code directory
│   ├── components/             # React component library (all components in flat structure)
│   │   ├── accordion.tsx       # Accordion component
│   │   ├── alert.tsx           # Alert component
│   │   ├── button.tsx          # Button component
│   │   ├── card.tsx            # Card component
│   │   ├── dialog.tsx          # Dialog component
│   │   ├── sidebar/            # Sidebar subcomponents
│   │   └── ... (40+ components)
│   ├── lib/                    # Utility library
│   │   └── utils.ts            # Common utility functions (cn)
│   └── styles/                 # Style system
│       ├── globals.css         # Global styles entry
│       ├── theme.css           # Theme configuration
│       ├── variables.css       # CSS variable definitions
│       ├── utils.css           # Utility class extensions
│       └── quota.css           # Quota-related styles
├── components.json             # shadcn/ui configuration
├── postcss.config.mjs          # PostCSS configuration
├── package.json                # Package configuration
├── tsconfig.json               # TypeScript configuration
├── DEV.md                      # Development documentation
└── DEV_ZH.md                   # Chinese development documentation
```

## 🎯 Quick Start

### Install Dependencies

```bash
# Only use Bun (project default package manager)
bun add @libra/ui
```

### Basic Configuration

1. **Import Global Styles**

```tsx
// app/globals.css or src/index.css
import '@libra/ui/globals.css'
```

**Note**: Style import paths are based on actual exports configuration, ensure the project has correct module resolution.

2. **Configure Theme Provider**

```tsx
// app/layout.tsx or src/App.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

3. **Use Components**

```tsx
import { Button } from '@libra/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@libra/ui/components/card'

export default function HomePage() {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Welcome to Libra UI</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  )
}
```

## 📦 Component Library

### 🎨 Foundation Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Button** | Button component | 8 variants, 4 sizes, supports icons and loading states |
| **Badge** | Badge component | Status indication, quantity display, multiple color themes |
| **Avatar** | Avatar component | Image avatar, text avatar, placeholder, size variants |
| **Separator** | Separator component | Horizontal/vertical separation, custom styles |
| **Skeleton** | Skeleton component | Content loading placeholder, animation effects |

### 📝 Data Entry Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Input** | Input component | Prefix/suffix, validation states, disabled state |
| **Textarea** | Textarea component | Auto-resize height, character count, resizable |
| **Select** | Select dropdown component | Single/multi-select, search filter, grouped options |
| **Checkbox** | Checkbox component | Three-state support, custom styles |
| **Switch** | Switch component | Toggle state, disabled state, size variants |
| **Slider** | Slider component | Single/range values, step control, markers |
| **Input OTP** | OTP input component | Auto-focus, paste support, custom length |
| **Form** | Form component | Field validation, error handling, form layout |

### 🗂️ Data Display Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Table** | Table component | Sorting, filtering, pagination, responsive |
| **Card** | Card component | Header, content, footer, shadow effects |
| **Accordion** | Accordion component | Single/multiple expand, animation transitions |
| **Tabs** | Tab component | Horizontal/vertical layout, keyboard navigation |
| **Calendar** | Calendar component | Date selection, range selection, localization |
| **Chart** | Chart component | Multiple chart types, responsive, theme adaptation |
| **Progress** | Progress component | Linear progress, circular progress, animation effects |

### 🧭 Navigation Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Navbar** | Navigation bar component | Responsive layout, brand area, action buttons |
| **Sidebar** | Sidebar component | Collapse/expand, mobile adaptation, multi-level menu |
| **Breadcrumb** | Breadcrumb navigation | Path navigation, custom separator, overflow handling |
| **Command** | Command palette | Quick search, keyboard navigation, grouped display |

### 💬 Feedback Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Alert** | Alert component | 4 types, icon support, dismissible |
| **Toast** | Toast notification | Multiple positions, auto-dismiss, action buttons |
| **Sonner** | Modern notification | Stacking effects, gesture operations, rich styles |
| **Loader** | Loading indicator | Multiple styles, size variants, color themes |
| **Multi Step Loader** | Multi-step loader | Step indication, progress animation, state management |

### 🎭 Overlay Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Dialog** | Dialog component | Modal window, keyboard navigation, focus management |
| **Alert Dialog** | Confirmation dialog | Dangerous action confirmation, custom buttons |
| **Sheet** | Drawer component | Four directions, gesture operations, responsive |
| **Drawer** | Bottom drawer | Mobile optimized, drag operations |
| **Popover** | Popover component | Smart positioning, click outside to close |
| **Tooltip** | Tooltip component | Hover display, keyboard trigger, delay control |
| **Dropdown Menu** | Dropdown menu | Multi-level menu, grouping, shortcuts |

### 🎨 Visual Effects Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Beam** | Beam effect | Radial gradient, multiple tones, dynamic effects |
| **Glow** | Glow effect | Background glow, position control, opacity adjustment |
| **Gradient Border** | Gradient border | Custom direction, color gradient, animation effects |
| **Grid Pattern** | Grid background | Dot pattern, gradient mask, size control |
| **Mockup** | Device mockup | Device shell, screen content, shadow effects |
| **Tile** | Tile component | Feature display, hover effects, content layout |

### 🔧 Utility Components

| Component | Description | Features |
|-----------|-------------|----------|
| **Scroll Area** | Scroll area | Custom scrollbar, smooth scrolling, touch support |
| **Section** | Section component | Page sections, container layout, spacing control |
| **Label** | Label component | Form labels, associated controls, style variants |
| **Kbd** | Keyboard key | Shortcut display, platform adaptation, style beautification |
| **use-mobile** | Mobile detection | Responsive Hook, breakpoint listening, device detection |

## 🎨 Theme System

### Tailwind CSS v4 Integration

Libra UI is built on **Tailwind CSS v4**, adopting the latest CSS-in-CSS syntax for more powerful theme customization capabilities:

```css
/* theme.css - Define theme using @theme directive */
@theme inline {
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --radius-lg: var(--radius);
  --animate-accordion-down: accordion-down 0.2s ease-out;
}
```

### Color System

#### Semantic Colors

Color naming system based on purpose rather than appearance:

| Color Category | Purpose | Examples |
|----------------|---------|----------|
| **Primary** | Main actions, brand color | Primary buttons, links, important information |
| **Secondary** | Secondary actions | Secondary buttons, auxiliary information |
| **Accent** | Emphasis, highlights | Selected state, active elements |
| **Muted** | Secondary content | Placeholder text, disabled state |
| **Destructive** | Dangerous actions | Delete buttons, error messages |
| **Brand** | Brand identity | Logo, brand elements |

#### OKLCH Color Space

Uses modern OKLCH color space for more accurate color representation:

```css
/* variables.css - OKLCH color definitions */
:root {
  /* Actual values from the project */
  --brand: oklch(66.5% 0.1804 47.04);
  --brand-foreground: oklch(75.77% 0.159 55.91);
  --primary: oklch(62% 0.14 39.04);
  --primary-foreground: oklch(100% 0 0);
  --background: oklch(98% 0.01 95.1);
  --foreground: oklch(34% 0.03 95.72);
}

.dark {
  --brand: oklch(83.6% 0.1177 66.87);
  --primary: oklch(67% 0.13 38.76);
  --primary-foreground: oklch(100% 0 0);
  --background: oklch(27% 0 106.64);
  --foreground: oklch(81% 0.01 93.01);
}
```

### Dark Mode

#### Automatic Theme Switching

```tsx
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
```

#### Theme Variables

All colors support automatic light/dark theme switching:

```css
/* Component styles that automatically adapt to theme */
.card {
  background-color: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
}
```

### CSS Variable Architecture

#### Layered Variable System

```css
/* 1. Base variable layer - variables.css */
:root {
  --radius: 0.625rem;  /* 10px */
  --brand: oklch(66.5% 0.1804 47.04);
  --primary: oklch(62% 0.14 39.04);
}

/* 2. Theme mapping layer - theme.css with Tailwind v4 */
@theme inline {
  --color-brand: var(--brand);
  --color-primary: var(--primary);
  --color-background: var(--background);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

/* 3. Component application layer (using Tailwind utilities) */
.button {
  @apply bg-primary text-primary-foreground rounded-lg;
}
```

### Animation System

#### Built-in Animations

| Animation Name | Purpose | Duration |
|----------------|---------|----------|
| `accordion-down/up` | Accordion expand/collapse | 0.2s |
| `appear` | Element fade in | 0.4s |
| `appear-zoom` | Element zoom in | 0.4s |
| `marquee` | Marquee scrolling | Configurable |
| `pulse-fade` | Pulse fade in/out | 6s |
| `shiny-text` | Text shine effect | 2.5s |

#### Custom Animations

```css
/* theme.css - Define keyframes */
@keyframes custom-slide {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Register animation */
@theme inline {
  --animate-custom-slide: custom-slide 0.3s ease-out;
}
```

### Utility Class Extensions

#### Custom Utility Classes

```css
/* utils.css - Actual utilities from the project using @utility directive */
/* Glass morphism effects with Tailwind v4 */
@utility glass-1 {
  @apply border-border from-card/80 to-card/40 dark:border-border/10 
         dark:border-b-border/5 dark:border-t-border/20 dark:from-card/5 
         dark:to-card/0 border bg-linear-to-b;
}

@utility glass-2 {
  @apply border-border from-card/100 to-card/80 dark:border-border/10 
         dark:border-b-border/5 dark:border-t-border/20 dark:from-card/10 
         dark:to-card/5 border bg-linear-to-b;
}

/* Fade mask effects */
@utility fade-x {
  mask-image: linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%);
}

@utility fade-bottom {
  mask-image: linear-gradient(to top, transparent 0%, black 35%);
}
```

#### Responsive Utility Classes

```tsx
// Using responsive prefixes
<div className="p-4 md:p-8 lg:p-12">
  <h1 className="text-lg md:text-xl lg:text-2xl">
    Responsive Title
  </h1>
</div>
```

## 🧩 Component Design Patterns

### Radix UI Integration

Libra UI components are built on top of Radix UI primitives, using the consolidated `radix-ui` package:

```tsx
// Example: Dialog component implementation
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Slot as SlotPrimitive } from 'radix-ui'

// Components use Radix primitives with custom styling
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogContent = DialogPrimitive.Content
```

This approach provides:
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Headless UI**: Complete control over styling while maintaining behavior
- **Composability**: Mix and match primitive parts to create complex components

### Composition Pattern

Most complex components use composition pattern design, allowing flexible assembly of different parts:

```tsx
// Card component composition usage
<Card className="w-96">
  <CardHeader>
    <CardTitle>Project Statistics</CardTitle>
    <CardDescription>Monthly data overview</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span>Total Visits</span>
        <Badge variant="secondary">12,345</Badge>
      </div>
      <Progress value={75} className="w-full" />
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">View Details</Button>
  </CardFooter>
</Card>
```

### Variant System

Uses **CVA (Class Variance Authority)** for type-safe style variants:

```tsx
// Button component variant definition
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Using variants
<Button variant="destructive" size="lg">
  Delete Project
</Button>
```

### Slot Pattern

Uses `asChild` prop to implement component slots, allowing custom element replacement. Note that Libra UI uses the `radix-ui` package which provides the `Slot` primitive:

```tsx
// Button component used as Link
<Button asChild>
  <Link href="/dashboard">
    <BarChart className="mr-2 h-4 w-4" />
    View Dashboard
  </Link>
</Button>

// Dialog trigger customization
<DialogTrigger asChild>
  <Card className="cursor-pointer hover:shadow-md">
    <CardContent className="p-6">
      <h3>Click to open dialog</h3>
    </CardContent>
  </Card>
</DialogTrigger>
```

### Context Pattern

Complex components use React Context to share state within component tree:

```tsx
// Sidebar context implementation
const SidebarContext = React.createContext<SidebarContextProps | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

// Using context
function SidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
      <PanelLeft className="h-4 w-4" />
    </Button>
  )
}
```

## 🛠️ Development Guide

### Component Import

All components can be imported directly from `@libra/ui`:

```tsx
// Component imports (based on package.json exports configuration)
import { Button } from '@libra/ui/components/button'
import { Input } from '@libra/ui/components/input'
import { Card, CardContent, CardHeader, CardTitle } from '@libra/ui/components/card'

// Utility function import
import { cn } from '@libra/ui/lib/utils'

// Global styles import
import '@libra/ui/globals.css'
```

### Custom Component Styling

#### Using className Prop

```tsx
import { Button } from '@libra/ui'
import { cn } from '@libra/ui/lib/utils'

function CustomButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-purple-500 to-pink-500",
        "hover:from-purple-600 hover:to-pink-600",
        "text-white font-bold",
        className
      )}
      {...props}
    />
  )
}
```

#### Extending Existing Components

```tsx
import { Card, CardContent } from '@libra/ui'
import { cn } from '@libra/ui/lib/utils'

interface FeatureCardProps extends React.ComponentProps<typeof Card> {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description, className, ...props }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-shadow duration-200",
        "border-2 hover:border-primary/20",
        className
      )}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Theme Toggle Implementation

```tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@libra/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@libra/ui'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## 📋 Best Practices

### 1. Maintain Design Consistency

```tsx
// ✅ Recommended: Use design system provided components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Action Button</Button>
  </CardContent>
</Card>

// ❌ Not recommended: Custom implementation of same functionality
<div className="border rounded-lg p-4 shadow">
  <h3 className="font-bold text-lg mb-2">Title</h3>
  <div className="pt-4">
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Action Button
    </button>
  </div>
</div>
```

### 2. Respect Theme System

```tsx
// ✅ Recommended: Use semantic color variables
<div className="bg-card text-card-foreground border border-border">
  <p className="text-muted-foreground">Secondary text</p>
  <Button variant="destructive">Dangerous action</Button>
</div>

// ❌ Not recommended: Hard-coded color values
<div className="bg-white text-black border border-gray-200 dark:bg-gray-900 dark:text-white">
  <p className="text-gray-500 dark:text-gray-400">Secondary text</p>
  <button className="bg-red-500 text-white">Dangerous action</button>
</div>
```

### 3. Prioritize Component Variants

```tsx
// ✅ Recommended: Use built-in variants
<Button variant="outline" size="lg">
  Large Outline Button
</Button>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Operation failed, please try again</AlertDescription>
</Alert>

// ❌ Not recommended: Completely custom styling
<Button className="border-2 border-gray-300 bg-transparent text-gray-700 px-8 py-3 text-lg">
  Large Outline Button
</Button>
```

### 4. Responsive Design

```tsx
// ✅ Recommended: Use responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="p-4 md:p-6">
    <h3 className="text-lg md:text-xl lg:text-2xl">Responsive Title</h3>
    <Button size="sm" className="md:size-default lg:size-lg">
      Responsive Button
    </Button>
  </Card>
</div>
```

### 5. Accessibility Considerations

```tsx
// ✅ Recommended: Complete accessibility support
<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Settings className="mr-2 h-4 w-4" />
      Settings
      <span className="sr-only">Open settings dialog</span>
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Configure your application settings
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>

// Form label association
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter email"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-sm text-destructive">
    Please enter a valid email address
  </p>
</div>
```

## ❓ Frequently Asked Questions

### Q: How to customize theme colors?

A: Modify color variables in the `variables.css` file:

```css
:root {
  /* Custom primary color */
  --primary: oklch(50% 0.2 280); /* Purple theme */
  --primary-foreground: oklch(98% 0.02 280);

  /* Custom brand color */
  --brand: oklch(60% 0.15 120); /* Green brand */
  --brand-foreground: oklch(98% 0.02 120);
}

.dark {
  --primary: oklch(70% 0.25 280);
  --primary-foreground: oklch(20% 0.05 280);
}
```

### Q: How to add new component variants?

A: Extend existing CVA variant definitions:

```tsx
import { buttonVariants } from '@libra/ui'
import { cva } from 'class-variance-authority'

// Extend button variants
const extendedButtonVariants = cva(buttonVariants(), {
  variants: {
    variant: {
      // Inherit original variants
      ...buttonVariants.config.variants.variant,
      // Add new variants
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      neon: 'bg-black text-green-400 border border-green-400 shadow-[0_0_10px_theme(colors.green.400)]',
    },
  },
})
```

### Q: How to handle Server-Side Rendering (SSR)?

A: Ensure proper theme provider configuration:

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Q: How to optimize bundle size?

A: Use on-demand imports and Tree Shaking:

```tsx
// ✅ Recommended: Individual component imports
import { Button } from '@libra/ui/components/button'
import { Card, CardContent } from '@libra/ui/components/card'

// ✅ Utility function import
import { cn } from '@libra/ui/lib/utils'

// ❌ Avoid: Attempting to import all components at once
// Components are exported individually through package.json exports field
```

### Q: How to integrate into existing projects?

A: Progressive integration steps:

1. **Install dependencies**
```bash
# Use project recommended package manager
bun add @libra/ui
```

2. **Import styles**
```tsx
import '@libra/ui/globals.css'
```

3. **Gradually replace components**
```tsx
// Original component
<button className="btn btn-primary">Button</button>

// Replace with Libra UI
<Button variant="default">Button</Button>
```

4. **Configure theme**
```tsx
<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

## 🚀 Summary

Libra UI Design System provides a complete solution for modern web application development:

### 🎯 Core Advantages

- **🎨 Modern Design**: Based on Tailwind CSS v4 and OKLCH color space
- **🧩 Rich Components**: 47+ carefully designed components covering all common scenarios
- **♿ Accessibility**: Complies with WCAG 2.1 AA standards, supports keyboard navigation and screen readers
- **📱 Responsive**: Mobile-first design philosophy, perfectly adapts to various devices
- **🎭 Theme System**: Complete light/dark theme support, flexible brand customization
- **🛠️ Developer Friendly**: TypeScript support, comprehensive documentation and examples

### 📈 Use Cases

- **Enterprise Applications**: Management dashboards, data dashboards, business systems
- **Product Websites**: Marketing pages, product showcases, user centers
- **Mobile Applications**: Responsive web applications, PWA applications
- **Prototype Design**: Rapid prototype development, proof of concept

### 🔧 Development Environment Configuration

### Required Dependencies

Based on actual package.json analysis, @libra/ui core dependencies include:

```json
{
  "dependencies": {
    "radix-ui": "^1.4.2", // Radix UI components (single package)
    "@radix-ui/react-accordion": "^1.2.11", // Additional Radix components
    "@radix-ui/react-icons": "^1.3.2", // Radix icon library
    "class-variance-authority": "^0.7.1", // CVA variant system
    "next-themes": "^0.4.6", // Theme switching
    "lucide-react": "^0.486.0", // Icon library
    "tailwindcss": "^4.1.11", // Tailwind CSS v4
    "@tailwindcss/postcss": "^4.1.11", // Tailwind PostCSS plugin
    "sonner": "^^2.2.2", // Modern notification system
    "cmdk": "^0.2.1", // Command component
    "react-hook-form": "^7.60.0", // Form handling
    "input-otp": "^1.4.2", // OTP input component
    "react-day-picker": "^9.8.0" // Date picker component
  }
}
```

### Tailwind Configuration

Project uses Tailwind CSS v4's latest syntax:

```css
/* globals.css */
@import "tailwindcss";
@import "./utils.css";
@import "./theme.css";
@import "./variables.css";
```

### PostCSS Configuration

Ensure PostCSS is correctly configured to support Tailwind v4:

```js
// postcss.config.mjs
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
```

### Actual Color System

Based on variables.css file, project uses OKLCH color space:

```css
:root {
  /* Brand colors */
  --brand: oklch(66.5% 0.1804 47.04);
  --brand-foreground: oklch(75.77% 0.159 55.91);
  
  /* Base colors */
  --background: oklch(98% 0.01 95.1);
  --foreground: oklch(34% 0.03 95.72);
  --primary: oklch(62% 0.14 39.04);
  --primary-foreground: oklch(100% 0 0);
  
  /* Border and radius */
  --radius: 0.625rem;
}

.dark {
  --brand: oklch(83.6% 0.1177 66.87);
  --background: oklch(27% 0 106.64);
  --foreground: oklch(81% 0.01 93.01);
}
```

### Component Import Pattern

Based on actual exports configuration, supports the following import methods:

```tsx
// Style files
import '@libra/ui/globals.css'

// Individual components
import { Button } from '@libra/ui/components/button'

// Utility functions
import { cn } from '@libra/ui/lib/utils'
```

## 🔮 Future Plans

- **Component Extension**: Continuously adding new components and features
- **Performance Optimization**: Bundle size optimization, runtime performance improvement
- **Ecosystem Building**: Template library, example projects, community contributions

---

## 📚 Related Resources

- **GitHub Repository**: [libra](https://github.com/nextify-limited/libra)
- **Community Discussion**: [GitHub Discussions](https://github.com/nextify-limited/libra/discussions)

## 🤝 Contributing Guide

Community contributions are welcome! Please check [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

### Ways to Contribute

- 🐛 **Bug Reports**: Submit issues when you find problems
- 💡 **Feature Suggestions**: New feature ideas are welcome for discussion
- 📝 **Documentation Improvement**: Help improve documentation content
- 🔧 **Code Contributions**: Submit Pull Requests

---