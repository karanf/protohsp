# EGAB Technical Documentation

## Development Environment

### Prerequisites
- Node.js v18+ (as specified in engines)
- pnpm v9.0.0+ (as specified in packageManager)
- Git
- Supabase account (for database and authentication)

### Getting Started
1. Clone the repository
2. Run `pnpm install` at the root
3. Configure Supabase environment variables
4. Run `pnpm dev` to start all applications in development mode

### Workspace Structure
```
egab/
├── apps/                  # Applications
│   ├── greenheart/        # Greenheart application
│   ├── educatius/         # Educatius application
│   └── web/               # Web application
├── packages/              # Shared packages
│   ├── ui/                # UI component library
│   ├── designsystem/      # Design system package
│   ├── database/          # Supabase client and type definitions
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── ...
```

## Technology Stack

### Core Technologies

| Technology | Purpose | Minimum Version | Notes |
|------------|---------|-----------------|-------|
| Next.js | React framework for applications | 15.2.1 | **DO NOT DOWNGRADE** |
| React | UI library | 19.0.0 | **DO NOT DOWNGRADE** |
| TypeScript | Type-safe JavaScript | 5.8.2 | **DO NOT DOWNGRADE** |
| Tailwind CSS | Utility-first CSS framework | 4.0.14 | **DO NOT DOWNGRADE** |
| Turbo | Monorepo build system | 2.4.4 | **DO NOT DOWNGRADE** |
| pnpm | Package manager | 9.0.0 | **DO NOT DOWNGRADE** |
| Supabase | Database and authentication | latest | Use for data persistence |

### Version Management Rules

1. **NO DOWNGRADES**: Never downgrade dependencies below the specified minimum versions
2. Minor version upgrades (e.g., 4.0.x to 4.0.y) are generally safe
3. Major/minor version upgrades (e.g., 4.0.x to 4.1.x or 5.0.x) should be carefully tested
4. For any upgrade, test all applications thoroughly before committing

### Import Path Rules

1. **Workspace Package Imports**: Always use `@repo/` prefix for importing from workspace packages
   ```tsx
   // CORRECT
   import { Button } from "@repo/ui/components/ui/button";
   
   // INCORRECT
   import { Button } from "@/components/ui/button"; // Wrong for workspace packages
   import { Button } from "../../../packages/ui/components/ui/button"; // Avoid deep relative imports
   ```

2. **App-local Imports**: Use `@/` prefix for imports within the same application
   ```tsx
   // CORRECT
   import { Dashboard } from "@/components/dashboard";
   
   // AVOID
   import { Dashboard } from "../../components/dashboard"; // Avoid deep relative paths
   ```

3. **Relative Imports**: Only use relative imports for files in the same directory or immediate subdirectories

### UI Component Library

The `@repo/ui` package provides a comprehensive set of UI components built on top of:

- **Shadcn/UI**: Component patterns with Tailwind CSS
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide React**: Icon library (v0.483.0+, **DO NOT DOWNGRADE**)

### Design System

The `@repo/designsystem` package implements design tokens and styling utilities:

- Color schemes
- Typography scales
- Spacing system
- Responsive breakpoints

### Database and Authentication

The `@repo/database` package provides:

- Supabase client configuration
- Generated TypeScript types for database schema
- Utility hooks for common data operations
- Authentication utilities

## Database Schema

The Supabase database includes the following key tables:

1. **Users**: Core user accounts and profiles
   - Local Coordinators
   - Regional Directors
   - Administrators
   - Students
   - Host Families

2. **Applications**:
   - Local Coordinator applications
   - Host Family applications
   - Student applications
   - Placement applications

3. **Relationships**:
   - Student-Host Family matches
   - Local Coordinator-Host Family relationships
   - Regional Director-Local Coordinator relationships

4. **Monitoring**:
   - Check-ins
   - Home visits
   - Progress reports

## Development Workflows

### Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all applications in development mode |
| `pnpm build` | Build all applications and packages |
| `pnpm lint` | Lint all applications and packages |
| `pnpm format` | Format code with Prettier |
| `pnpm check-types` | Check TypeScript types |
| `pnpm db:types` | Generate TypeScript types from Supabase |

### Adding UI Components

To add a new Shadcn/UI component:

```bash
cd packages/ui
bash install-shadcn-components.sh [component-name]
```

### Creating a New Application

1. Copy an existing application folder structure
2. Update `package.json` with the new name and dependencies
3. Configure imports from shared packages
4. Add the application to the workspace in `turbo.json`

### Working with Supabase

1. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Use the shared client:
   ```tsx
   import { supabase } from '@repo/database'
   
   // Fetch data
   const { data, error } = await supabase
     .from('users')
     .select('*')
   ```

3. Use type-safe queries with generated types:
   ```tsx
   import { supabase } from '@repo/database'
   import type { Database } from '@repo/database/types'
   
   type User = Database['public']['Tables']['users']['Row']
   ```

## Design Patterns

### Component Structure

UI components follow a consistent pattern:
- Props defined with TypeScript interfaces
- Variants using `cva` for consistent styling
- Accessibility features built-in
- Comprehensive test coverage

### Application Architecture

Next.js applications follow these patterns:
- App Router for routing and layouts
- Server Components for data fetching and rendering
- Client Components for interactive elements
- Shared UI components from packages
- Supabase for data persistence and auth

## Data Access Patterns

- Use Server Components for initial data loading
- Use React Query (TanStack Query) for client-side data fetching
- Use Supabase subscriptions for real-time updates when needed
- Implement proper error handling and loading states

## Performance Considerations

- Server-side rendering for initial page load
- Client-side rendering for interactive elements
- Caching strategies for data fetching
- Bundle size optimization with code splitting
- Image optimization with Next.js Image component

## Deployment Strategy

Applications can be deployed independently or together using:
- Vercel for Next.js applications
- GitHub Actions for CI/CD pipelines
- Docker containers for specialized deployments
- Supabase for hosted database and authentication
