# EGAB Architecture

## System Overview

EGAB uses a monorepo architecture powered by Turborepo to manage multiple applications and shared packages. This approach enables code sharing, consistent development practices, and efficient build processes.

```mermaid
flowchart TD
    subgraph Workspace[EGAB Workspace]
        Apps[Apps]
        Packages[Packages]
        Supabase[(Supabase)]
        
        subgraph Apps
            Greenheart[Greenheart]
            Educatius[Educatius]
            Web[Web]
        end
        
        subgraph Packages
            UI[UI Components]
            DesignSystem[Design System]
            Database[Database Client]
            ESLintConfig[ESLint Config]
            TSConfig[TypeScript Config]
        end
        
        Greenheart -- uses --> UI
        Greenheart -- uses --> DesignSystem
        Greenheart -- uses --> Database
        Greenheart -- uses --> ESLintConfig
        Greenheart -- uses --> TSConfig
        
        Educatius -- uses --> UI
        Educatius -- uses --> DesignSystem
        Educatius -- uses --> Database
        Educatius -- uses --> ESLintConfig
        Educatius -- uses --> TSConfig
        
        Web -- uses --> UI
        Web -- uses --> DesignSystem
        Web -- uses --> ESLintConfig
        Web -- uses --> TSConfig
        
        Database -- connects to --> Supabase
        Greenheart -- auth --> Supabase
        Educatius -- auth --> Supabase
    end
```

## Core Components

### Application Layer

The application layer consists of distinct Next.js applications:

1. **Greenheart**: Receiving Organization platform for handling local coordinators, host families, and student placements
2. **Educatius**: Sending Organization platform for managing student applications and program monitoring
3. **Web**: UI component showcase application

Each application:
- Maintains its own routing and pages
- Imports shared components from packages
- Can implement application-specific features
- Connects to Supabase for data persistence

### Shared Packages Layer

Shared packages provide reusable code across applications:

1. **UI**: Component library built with React and Tailwind CSS
   - Implements Shadcn/UI design patterns
   - Provides accessible, performance-optimized components

2. **Design System**: Consistent design tokens and styling
   - Color schemes
   - Typography
   - Spacing and layout rules

3. **Database**: Supabase client and utilities
   - Shared database client
   - Type definitions
   - Helper functions and hooks for data access
   - Authentication utilities

4. **Configuration Packages**:
   - ESLint configuration
   - TypeScript configuration

### Data Layer

Supabase provides a complete solution for:

1. **Database**: PostgreSQL database with domain-based tables:
   - Users (all user types across applications)
   - Profiles (coordinator, host family, student profiles)
   - Applications (coordinator, host family, student applications)
   - Relationships (connections between entities)
   - Placements (student-host family matches)
   - Monitoring (check-ins, visits, etc.)

2. **Authentication**: User management with:
   - Email/password authentication
   - Role-based access control
   - Session management

3. **Storage**: File storage for:
   - Application documents
   - Profile images
   - Supporting materials

## Data Flow Architecture

```mermaid
flowchart LR
    User((User))
    User <--> NextApp[Next.js Applications]
    NextApp <--> SupabaseClient[Supabase Client]
    NextApp -- imports --> UIComponents[UI Components]
    NextApp -- uses --> DesignTokens[Design System]
    SupabaseClient <--> Database[(Supabase Database)]
    SupabaseClient <--> Auth[Supabase Auth]
    SupabaseClient <--> Storage[Supabase Storage]
```

## Build and Deployment Architecture

Turborepo manages the build process with:
- Smart caching to avoid redundant builds
- Parallel task execution
- Dependency graph awareness

The build process generates optimized assets for each application, which can be deployed independently or as part of a coordinated release.

## Security Architecture

Note: As mentioned in the product requirements, EGAB is a sandboxing environment for prototypes, so comprehensive security protocols for authentication aren't required. However, basic practices are still followed:

- Strict typing with TypeScript
- Component-level input validation
- Secure API communication patterns
- Basic role-based access control through Supabase

## Database Schema Architecture

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string role
        jsonb metadata
        timestamp created_at
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK
        string type
        jsonb data
        timestamp created_at
    }
    
    APPLICATIONS {
        uuid id PK
        string type
        string status
        uuid submitter_id FK
        uuid reviewer_id FK
        jsonb data
        jsonb feedback
        timestamp created_at
    }
    
    RELATIONSHIPS {
        uuid id PK
        string type
        uuid primary_id FK
        uuid secondary_id FK
        string status
        jsonb data
        timestamp created_at
    }
    
    PLACEMENTS {
        uuid id PK
        uuid student_profile_id FK
        uuid host_family_profile_id FK
        uuid coordinator_profile_id FK
        uuid application_id FK
        string status
        date start_date
        date end_date
        jsonb details
        timestamp created_at
    }
    
    MONITORING {
        uuid id PK
        string type
        uuid placement_id FK
        uuid conducted_by FK
        string status
        timestamp date
        jsonb details
        timestamp created_at
    }
    
    USERS ||--o{ PROFILES : "has"
    USERS ||--o{ APPLICATIONS : "submits"
    USERS ||--o{ APPLICATIONS : "reviews"
    PROFILES ||--o{ RELATIONSHIPS : "primary in"
    PROFILES ||--o{ RELATIONSHIPS : "secondary in"
    PROFILES ||--o{ PLACEMENTS : "participates in"
    APPLICATIONS ||--o{ PLACEMENTS : "creates"
    PLACEMENTS ||--o{ MONITORING : "monitored by"
    USERS ||--o{ MONITORING : "conducts"
```

## Scalability Considerations

- Independent scaling of applications
- Shared UI components reduce maintenance overhead
- Consistent developer experience across teams
- Low-coupling design for team autonomy
- Supabase provides managed infrastructure that can scale with usage
- Application-agnostic database schema enables adding new applications without schema changes
