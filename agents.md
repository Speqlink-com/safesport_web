# Agent Rules & Guidelines for SafeSport Project

## 🚨 CRITICAL RULES - STRICTLY ENFORCE

### 1. Package Manager
- **ALWAYS use `pnpm`** - This project uses pnpm, NOT npm or yarn
- **Use `pnpx` instead of `npx`** for one-off commands
- Never run npm or npx commands

### 2. Component Library & Styling
- **shadcn/ui is MANDATORY** for all UI components
- **Tailwind CSS v4** is the ONLY styling framework
- NO custom CSS outside of Tailwind utility classes (except in globals.css)
- Use existing shadcn components before creating custom ones

### 3. Next.js 16 Specifics
- **Middleware is DEPRECATED** - Use the proxy.ts already defined instead
- Follow Next.js 16 conventions for routing and layouts
- Use App Router (not Pages Router)

### 4. Icons
- **react-icons** - Use for branded icons (Google, Facebook, etc.)
- **lucide-react** - Use for UI icons
- Flat color icons for social OAuth buttons (Google, Facebook)
- NO custom icon components unless absolutely necessary

### 5. Architecture
- **Clean Architecture** - Strict separation of concerns
- **Modularized Structure** - Feature-based modules
- Directory structure:
  ```
  app/
    (auth)/
      account/
        signin/
        signup/
        forgot-password/
        verify-otp/
    (dashboard)/
    ...
  features/
    auth/
      components/
      hooks/
      services/
      types/
      utils/
  ```

### 6. Development Workflow
- **NEVER BUILD IMMEDIATELY after editing files**
- **DIAGNOSE FILES AFTER EDIT** - Check syntax, imports, and logic
- **WEB SEARCH for updated libs** - Always verify library versions and APIs
- **NO ASSUMPTIONS** - If unsure about configuration, search or ask
- Test individual components before integrating

### 7. Documentation
- **MINIMIZE README creation** - Only when absolutely necessary
- **Use doc/ folder** - All documentation goes in `/doc` directory
- Keep README.md files concise and relevant
- Avoid over-documenting obvious code

### 8. Code Quality
- TypeScript strict mode
- Proper type definitions (no `any` unless justified)
- ESLint rules must pass
- Component props should be properly typed
- Use proper error handling

### 9. State Management & Data Fetching
- Server Components by default
- Client Components only when necessary (`'use client'`)
- Use React Server Actions for mutations
- Proper loading and error states

### 10. Authentication Module
- Modular auth components in `features/auth/`
- Reusable form components
- OAuth providers: Google, Facebook
- Email/Password authentication
- OTP verification
- Password reset flow

## 📝 Naming Conventions
- Components: PascalCase (e.g., `SignInForm.tsx`)
- Files: kebab-case or snake_case for routes (e.g., `sign-in.tsx`, `auth_layout.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Types: PascalCase with descriptive names (e.g., `AuthUser`, `SignInFormData`)

## 🎨 Design System
- Follow the theme defined in `globals.css`
- Use CSS variables for colors (e.g., `bg-background`, `text-foreground`)
- Maintain consistency with existing components
- Support dark mode via next-themes

## 🔍 Before Making Changes
1. Read existing related files
2. Check for existing similar components
3. Verify dependencies in package.json
4. Search for updated documentation if unsure
5. Match existing code patterns and style

## ⚠️ Anti-Patterns to Avoid
- ❌ Using npm/npx instead of pnpm/pnpx
- ❌ Creating custom components when shadcn exists
- ❌ Inline styles or styled-components
- ❌ Using middleware in Next.js 16
- ❌ Building before diagnosing edited files
- ❌ Assuming library APIs without verification
- ❌ Creating unnecessary README files
- ❌ Mixing architectural patterns
- ❌ Using `any` type without justification
- ❌ Client components when Server Components suffice

## ✅ Best Practices
- ✓ Use pnpm for all package operations
- ✓ Use shadcn components exclusively
- ✓ Verify library documentation via web search
- ✓ Diagnose files after editing
- ✓ Follow clean architecture principles
- ✓ Keep components modular and reusable
- ✓ Proper TypeScript typing
- ✓ Server Components by default
- ✓ Meaningful commit messages
- ✓ Test incrementally

## 🛠️ Common Commands
```bash
# Install dependencies
pnpm install

# Add shadcn component
pnpx shadcn@latest add [component-name]

# Run dev server
pnpm dev

# Build (only after diagnosis)
pnpm build

# Lint
pnpm lint
```

## 📦 Project Dependencies
- Next.js 16.3.2
- React 19.2.8
- Tailwind CSS v4
- shadcn/ui (via @base-ui/react)
- react-icons 5.7.0
- lucide-react 1.33.0
- next-themes 0.4.6

---

**Remember: When in doubt, web search for the latest documentation. Never assume configurations or APIs.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
