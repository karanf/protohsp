# Supabase Integration Implementation Plan

This document outlines the implementation approach for integrating Supabase into the EGAB project as the data persistence layer.

## Application-Agnostic Approach

The database implementation follows an application-agnostic approach where:

1. A single shared database serves all applications (Greenheart, Educatius, etc.)
2. Schema is organized by domain entities rather than by applications
3. Role-based access control determines what data users can access
4. A shared `@repo/database` package provides consistent access across applications

This approach ensures data consistency, avoids duplication, and simplifies adding new applications in the future.

## Setup Steps

### 1. Create Supabase Project

1. Sign up for Supabase account (if not already done)
2. Create a new project
3. Note the project URL and anon key for configuration

### 2. Create `@repo/database` Package

Create a new package in the `packages` directory:

```
packages/database/
├── src/
│   ├── index.ts              # Main export file
│   ├── client.ts             # Supabase client configuration
│   ├── schema/               # Schema type definitions
│   │   ├── index.ts          # Exports all schema types
│   │   └── generated.ts      # Generated types (from Supabase)
│   ├── hooks/                # Domain-based React hooks
│   │   ├── index.ts          # Exports all hooks
│   │   ├── auth.ts           # Authentication hooks
│   │   ├── users.ts          # User management hooks
│   │   ├── coordinators.ts   # Local coordinator hooks
│   │   ├── host-families.ts  # Host family hooks
│   │   ├── students.ts       # Student hooks
│   │   ├── placements.ts     # Placement hooks
│   │   ├── applications.ts   # Application process hooks
│   │   └── monitoring.ts     # Monitoring hooks
│   └── utils/                # Utility functions
│       ├── index.ts          # Exports all utilities
│       ├── auth.ts           # Auth utilities
│       ├── access-control.ts # Role-based access control
│       └── types.ts          # Common type definitions
├── types/                    # Type definitions
│   └── index.d.ts            # Package type declarations
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Documentation
```

### 3. Set Up Package Configuration

Create `package.json`:

```json
{
  "name": "@repo/database",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/**"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "check-types": "tsc --noEmit",
    "generate-types": "node scripts/generate-types.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@supabase/supabase-js": "^2.39.0",
    "react": "^19.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.8.2"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

### 4. Configure Supabase Client

Create `src/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './schema/generated';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 5. Create Main Export File

Create `src/index.ts`:

```typescript
// Export client
export { supabase } from './client';

// Export hooks
export * from './hooks';

// Export utilities
export * from './utils';

// Export schema types
export * from './schema';
```

## Domain-Based Database Schema

### 1. Initial Schema Setup

Create the following tables in Supabase:

#### Users Table (Core entity for all user types)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'coordinator', 'director', 'sending_org_staff', etc.
  application_id UUID, -- Reference to their application if applicable
  metadata JSONB, -- Additional user metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for admins to view all data
CREATE POLICY "Admins can view all user data" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

#### Profiles Table (Extensible profile data)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'coordinator', 'host_family', 'student', etc.
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

#### Applications Table (All application types)

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'coordinator', 'host_family', 'student', 'placement'
  status TEXT NOT NULL, -- 'draft', 'submitted', 'approved', 'rejected', etc.
  submitter_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  data JSONB NOT NULL, -- Application data
  feedback JSONB, -- Reviewer feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
```

#### Relationships Table (All types of relationships)

```sql
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'coordinator_student', 'host_family_student', 'director_coordinator'
  primary_id UUID REFERENCES profiles(id), -- e.g., coordinator_id
  secondary_id UUID REFERENCES profiles(id), -- e.g., student_id
  status TEXT NOT NULL, -- 'active', 'pending', 'terminated'
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
```

#### Placements Table (Student placements with host families)

```sql
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_profile_id UUID REFERENCES profiles(id),
  host_family_profile_id UUID REFERENCES profiles(id),
  coordinator_profile_id UUID REFERENCES profiles(id),
  application_id UUID REFERENCES applications(id), -- Reference to placement application
  status TEXT NOT NULL, -- 'pending', 'active', 'completed', 'cancelled'
  start_date DATE,
  end_date DATE,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
```

#### Monitoring Table (Check-ins and visits)

```sql
CREATE TABLE monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'check_in', 'home_visit', 'issue'
  placement_id UUID REFERENCES placements(id) ON DELETE CASCADE,
  conducted_by UUID REFERENCES users(id),
  status TEXT NOT NULL, -- 'scheduled', 'completed', 'cancelled'
  date TIMESTAMP WITH TIME ZONE,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE monitoring ENABLE ROW LEVEL SECURITY;
```

### 2. Row Level Security Policies

Set up appropriate RLS policies for each table to ensure users can only access data relevant to their role:

```sql
-- Example for placements table
CREATE POLICY "Coordinators can view their placements" ON placements
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'coordinator' AND
    coordinator_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Host families can view their own placements" ON placements
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'host_family' AND
    host_family_profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Add similar policies for other tables and actions (INSERT, UPDATE, DELETE)
```

### 3. Generate TypeScript Types

1. Install the Supabase CLI
2. Generate types with:
   ```bash
   supabase gen types typescript --project-id [YOUR_PROJECT_ID] > packages/database/src/schema/generated.ts
   ```
3. Create a script to automate this process in the future

## Authentication Implementation

### 1. Create Auth Hooks

Create `src/hooks/auth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role if logged in
        if (session?.user) {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (!error && data) {
            setRole(data.role);
          }
        } else {
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Initial session fetch
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role if logged in
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (!error && data) {
          setRole(data.role);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading, role };
}
```

### 2. Create Role-Based Access Control Utilities

Create `src/utils/access-control.ts`:

```typescript
import { Session } from '@supabase/supabase-js';

type UserRole = 'admin' | 'coordinator' | 'director' | 'host_family' | 'sending_org_staff';

export function hasRole(session: Session | null, roles: UserRole | UserRole[]): boolean {
  if (!session?.user) return false;
  
  const checkRoles = Array.isArray(roles) ? roles : [roles];
  const userRole = session.user.user_metadata?.role as UserRole | undefined;
  
  return checkRoles.includes(userRole);
}

export function canAccessEntity(session: Session | null, entityId: string, entityType: string): boolean {
  if (!session?.user) return false;
  
  // If user is admin, they can access everything
  if (hasRole(session, 'admin')) return true;
  
  // Logic for other roles
  // (In a real implementation, you would check relationships in the database)
  
  return false;
}
```

## Domain-Based Data Hooks

### 1. Create Generic Data Hook Factory

Create `src/utils/hook-factory.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../client';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export function createEntityHook<T>(tableName: string, baseQuery?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>) {
  return (options: { filters?: Record<string, any> } = {}) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { filters } = options;

    useEffect(() => {
      async function fetchData() {
        try {
          setLoading(true);
          let query = supabase.from(tableName).select('*');
          
          // Apply base query if provided
          if (baseQuery) {
            query = baseQuery(query);
          }
          
          // Apply filters
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          
          const { data, error } = await query;
          
          if (error) throw error;
          setData(data as T[] || []);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setLoading(false);
        }
      }

      fetchData();
    }, [JSON.stringify(filters)]);

    return { data, loading, error };
  };
}
```

### 2. Create Domain-Specific Hooks

Create hooks for each domain entity, for example `src/hooks/coordinators.ts`:

```typescript
import { createEntityHook } from '../utils/hook-factory';
import type { Database } from '../schema/generated';
import { supabase } from '../client';

// Type definitions
type Profile = Database['public']['Tables']['profiles']['Row'];
type CoordinatorProfile = Profile & { data: { [key: string]: any } };

// Get all coordinator profiles
export const useCoordinators = createEntityHook<CoordinatorProfile>('profiles', 
  (query) => query.eq('type', 'coordinator')
);

// Get a specific coordinator
export function useCoordinator(id: string) {
  const hook = createEntityHook<CoordinatorProfile>('profiles');
  return hook({ filters: { id, type: 'coordinator' } });
}

// Get coordinators by region director
export function useCoordinatorsByDirector(directorId: string) {
  return createEntityHook<CoordinatorProfile>('profiles', 
    (query) => query
      .eq('type', 'coordinator')
      .eq('data->region_director_id', directorId)
  )();
}

// Create a coordinator profile
export async function createCoordinatorProfile(userId: string, data: any) {
  return supabase
    .from('profiles')
    .insert({
      user_id: userId,
      type: 'coordinator',
      data
    })
    .select()
    .single();
}

// Update a coordinator profile
export async function updateCoordinatorProfile(id: string, data: any) {
  return supabase
    .from('profiles')
    .update({ data })
    .eq('id', id)
    .eq('type', 'coordinator')
    .select()
    .single();
}
```

Similarly, create hooks for other domains like host-families.ts, students.ts, etc.

## Application-Specific Context Providers

For each application, create a context provider that leverages the shared database hooks but applies application-specific logic:

### 1. Greenheart Context Provider

This provider would be used in the Greenheart application:

```tsx
// In apps/greenheart/app/providers/greenheart-provider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useAuth, useCoordinators, useHostFamilies } from '@repo/database';

interface GreenhartContextValue {
  // Application-specific state and functions
  coordinators: any[];
  hostFamilies: any[];
  // ...other state
}

const GreenhartContext = createContext<GreenhartContextValue | undefined>(undefined);

export function GreenhartProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  
  // Use shared hooks but apply Greenheart-specific filters/logic
  const { data: coordinators } = useCoordinators();
  const { data: hostFamilies } = useHostFamilies();
  
  // Additional Greenheart-specific logic here
  
  const value = {
    coordinators,
    hostFamilies,
    // ...other state and functions
  };
  
  return (
    <GreenhartContext.Provider value={value}>
      {children}
    </GreenhartContext.Provider>
  );
}

export function useGreenheart() {
  const context = useContext(GreenhartContext);
  if (context === undefined) {
    throw new Error('useGreenheart must be used within a GreenhartProvider');
  }
  return context;
}
```

### 2. Educatius Context Provider

Similar to the Greenheart provider but with Educatius-specific logic:

```tsx
// In apps/educatius/app/providers/educatius-provider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useAuth, useStudents, useSendingOrgStaff } from '@repo/database';

interface EducatiusContextValue {
  // Application-specific state and functions
  students: any[];
  staff: any[];
  // ...other state
}

const EducatiusContext = createContext<EducatiusContextValue | undefined>(undefined);

export function EducatiusProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  
  // Use shared hooks but apply Educatius-specific filters/logic
  const { data: students } = useStudents();
  const { data: staff } = useSendingOrgStaff();
  
  // Additional Educatius-specific logic here
  
  const value = {
    students,
    staff,
    // ...other state and functions
  };
  
  return (
    <EducatiusContext.Provider value={value}>
      {children}
    </EducatiusContext.Provider>
  );
}

export function useEducatius() {
  const context = useContext(EducatiusContext);
  if (context === undefined) {
    throw new Error('useEducatius must be used within a EducatiusProvider');
  }
  return context;
}
```

## Environment Configuration

### 1. Shared Environment Variables

Since all applications use the same Supabase instance, add the environment variables in a shared location:

1. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Make sure each application loads these environment variables, either through Next.js configuration or by duplicating them in each app directory.

### 2. Configure Auth in Applications

In each application, use the shared auth provider but with application-specific handling:

```tsx
// In apps/greenheart/app/layout.tsx
import { AuthProvider } from '@repo/ui/components/auth-provider';
import { GreenhartProvider } from './providers/greenheart-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GreenhartProvider>
            {children}
          </GreenhartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Next Steps

1. Create initial seed data for development and testing
2. Implement proper error handling and loading state components
3. Create data validation with Zod for type safety beyond TypeScript
4. Develop more complex domain-specific hooks as needed
5. Add real-time subscriptions for collaborative features
6. Create admin interfaces for data management across applications 