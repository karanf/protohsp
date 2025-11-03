# Laravel API Migration Guide

## Overview

This document provides a step-by-step guide for migrating the EGAB Next.js frontend from InstantDB to a Laravel API backend while preserving all the superior frontend functionality and user experience.

## Migration Strategy

The migration leverages the existing clean architecture where all components use a single `useInstantData()` hook for data fetching. By replacing this hook with a Laravel API equivalent, we can maintain all existing components unchanged while switching to a production-ready Laravel backend.

## Prerequisites

- Existing Laravel backend API
- Laravel Sanctum or Passport for authentication
- Next.js frontend (current codebase)
- Node.js v18+ and pnpm

## Migration Timeline

**Total Duration: 2-4 weeks**

- **Week 1**: API integration and data fetching hook replacement
- **Week 2**: Authentication and error handling
- **Week 3**: Testing and optimization
- **Week 4**: Real-time features (optional)

---

## Phase 1: API Integration (Week 1)

### Step 1.1: Install Required Dependencies

```bash
# In the root directory
pnpm add @tanstack/react-query
pnpm add @tanstack/react-query-devtools # Optional: for debugging
```

### Step 1.2: Create API Client

Create a new API client in the shared packages:

```typescript
// packages/api-client/src/index.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Data fetching methods
  async getAllData() {
    return this.request<{
      users: User[];
      profiles: Profile[];
      relationships: Relationship[];
    }>('/api/data');
  }

  async getUsers() {
    return this.request<User[]>('/api/users');
  }

  async getProfiles() {
    return this.request<Profile[]>('/api/profiles');
  }

  async getRelationships() {
    return this.request<Relationship[]>('/api/relationships');
  }

  // CRUD operations
  async createUser(userData: Partial<User>) {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/api/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<User>('/api/me');
  }
}

// Create singleton instance
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
);
```

### Step 1.3: Create Package Configuration

```json
// packages/api-client/package.json
{
  "name": "@repo/api-client",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "eslint": "^9.29.0",
    "prettier": "^3.5.3",
    "typescript": "^5.8.2"
  }
}
```

### Step 1.4: Replace Data Fetching Hook

```typescript
// apps/greenheart/lib/useApiData.ts
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@repo/api-client';
import { useState, useEffect } from 'react';

// Type definitions (keep existing ones from useInstantData.ts)
export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  status: string;
  metadata?: any;
  lastSignIn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  type: string;
  data: any;
  status: string;
  verified: boolean;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
  type: string;
  primaryId: string;
  secondaryId: string;
  status: string;
  startDate?: Date;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiDataReturn {
  users: User[];
  profiles: Profile[];
  relationships: Relationship[];
  isLoading: boolean;
  error: string | null;
  usedFallback: boolean;
  usingServiceClient: boolean;
  refetch: () => void;
}

export function useApiData(): ApiDataReturn {
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Set up authentication token
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || 
                 sessionStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      apiClient.setToken(token);
    }
  }, []);

  // Main data query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['app-data'],
    queryFn: async () => {
      const response = await apiClient.getAllData();
      return response.data;
    },
    enabled: !!authToken, // Only run query if authenticated
    staleTime: 30000, // Cache for 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle authentication redirect
  useEffect(() => {
    if (error && error.message?.includes('401')) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      setAuthToken(null);
      
      // Redirect to login
      window.location.href = '/login';
    }
  }, [error]);

  // Return data in same format as useInstantData
  return {
    users: data?.users || [],
    profiles: data?.profiles || [],
    relationships: data?.relationships || [],
    isLoading: isLoading || !authToken,
    error: error?.message || null,
    usedFallback: false,
    usingServiceClient: true,
    refetch,
  };
}

// Alias for backward compatibility
export const useInstantData = useApiData;
```

### Step 1.5: Update Package Dependencies

```json
// apps/greenheart/package.json
{
  "dependencies": {
    "@repo/api-client": "workspace:*",
    "@tanstack/react-query": "^5.0.0",
    // ... existing dependencies
  }
}
```

---

## Phase 2: Authentication & Error Handling (Week 2)

### Step 2.1: Create Authentication Context

```typescript
// apps/greenheart/lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@repo/api-client';

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setToken(token);
        try {
          const response = await apiClient.getMe();
          setUser(response.data);
        } catch (error) {
          // Invalid token, clear it
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      apiClient.setToken(token);
      setUser(user);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    apiClient.setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Step 2.2: Update Root Layout

```typescript
// apps/greenheart/app/layout.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/lib/auth-context';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000,
        retry: 3,
      },
    },
  }));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Step 2.3: Create Login Component

```typescript
// apps/greenheart/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(credentials);
      router.push('/sevis-user');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Phase 3: Laravel Backend Requirements

### Step 3.1: Required Laravel API Endpoints

```php
// routes/api.php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RelationshipController;

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth user info
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Bulk data endpoint (for initial page load)
    Route::get('/data', [DataController::class, 'index']);
    
    // Individual resource endpoints
    Route::apiResource('users', UserController::class);
    Route::apiResource('profiles', ProfileController::class);
    Route::apiResource('relationships', RelationshipController::class);
});
```

### Step 3.2: Data Controller Implementation

```php
// app/Http/Controllers/DataController.php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use App\Models\Relationship;
use Illuminate\Http\Request;

class DataController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::all(),
            'profiles' => Profile::all(),
            'relationships' => Relationship::all(),
        ]);
    }
}
```

### Step 3.3: Model Transformations

```php
// app/Models/User.php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'email',
        'role',
        'first_name',
        'last_name',
        'phone',
        'avatar_url',
        'status',
        'metadata',
        'last_sign_in',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_sign_in' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['firstName', 'lastName'];

    // Transform snake_case to camelCase for frontend
    public function getFirstNameAttribute()
    {
        return $this->first_name;
    }

    public function getLastNameAttribute()
    {
        return $this->last_name;
    }

    public function getAvatarUrlAttribute($value)
    {
        return $this->attributes['avatar_url'];
    }
}
```

---

## Phase 4: Testing & Validation (Week 3)

### Step 4.1: Create Migration Test Script

```typescript
// scripts/test-migration.ts
import { apiClient } from '@repo/api-client';

async function testMigration() {
  console.log('🧪 Testing Laravel API Migration...');
  
  try {
    // Test authentication
    console.log('Testing authentication...');
    const loginResponse = await apiClient.login({
      email: 'test@example.com',
      password: 'password'
    });
    console.log('✅ Authentication successful');
    
    // Test data fetching
    console.log('Testing data fetching...');
    const dataResponse = await apiClient.getAllData();
    console.log(`✅ Data fetched: ${dataResponse.data.users.length} users`);
    
    // Test CRUD operations
    console.log('Testing CRUD operations...');
    const newUser = await apiClient.createUser({
      email: 'test-new@example.com',
      role: 'student',
      firstName: 'Test',
      lastName: 'User',
      status: 'active'
    });
    console.log('✅ User creation successful');
    
    await apiClient.deleteUser(newUser.data.id);
    console.log('✅ User deletion successful');
    
    console.log('🎉 Migration test completed successfully!');
  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

testMigration();
```

### Step 4.2: Component Testing Checklist

Create a checklist to verify all components work correctly:

```markdown
## Component Testing Checklist

### Navigation & Layout
- [ ] Left sidebar navigation works
- [ ] User dropdown menu functions
- [ ] Year selector updates correctly
- [ ] Logout functionality works

### Home View
- [ ] Metrics display correctly
- [ ] Application review cards show proper counts
- [ ] Failed SEVIS records table loads
- [ ] Navigation buttons work

### Students View
- [ ] Student list loads and displays
- [ ] Filtering by status works
- [ ] Search functionality works
- [ ] Student detail navigation works
- [ ] Pagination works (if implemented)

### Host Families View
- [ ] Host family list loads
- [ ] Status filtering works
- [ ] Host family details display

### Local Coordinators View
- [ ] Coordinator list loads
- [ ] Status filtering works
- [ ] Coordinator metrics display

### SEVIS View
- [ ] SEVIS metrics display
- [ ] Chart data loads
- [ ] Individual records table works
- [ ] Batch processing view works

### Placements View
- [ ] Placements list loads
- [ ] Status filtering works
- [ ] Placement details display

### Student Application View
- [ ] Application form loads
- [ ] Form submission works
- [ ] File upload functionality
- [ ] Status updates work
```

---

## Phase 5: Real-time Features (Week 4 - Optional)

### Step 5.1: WebSocket Integration

```typescript
// lib/useRealTimeUpdates.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:6001'
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.channel === 'data-updates') {
        // Invalidate and refetch data when updates occur
        queryClient.invalidateQueries({ queryKey: ['app-data'] });
      }
    };

    return () => ws.close();
  }, [queryClient]);
}
```

### Step 5.2: Laravel Broadcasting Setup

```php
// config/broadcasting.php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'encrypted' => true,
    ],
],

// app/Events/DataUpdated.php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DataUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new Channel('data-updates');
    }
}
```

---

## Environment Configuration

### Step 6.1: Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:6001

# .env (Laravel)
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:3001,localhost:3003
SESSION_DOMAIN=localhost

# Broadcasting (optional)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-key
PUSHER_APP_SECRET=your-secret
PUSHER_APP_CLUSTER=mt1
```

### Step 6.2: CORS Configuration

```php
// config/cors.php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3001', 'http://localhost:3003'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## Migration Execution Plan

### Pre-Migration Checklist

- [ ] Laravel API is fully functional
- [ ] Database schema matches InstantDB structure
- [ ] Authentication is properly configured
- [ ] CORS settings allow frontend access
- [ ] Test credentials are available

### Migration Steps

1. **Branch Creation**: Create feature branch `feature/laravel-api-migration`
2. **Package Installation**: Install required dependencies
3. **API Client Creation**: Create and configure API client package
4. **Hook Replacement**: Replace `useInstantData` with `useApiData`
5. **Authentication Setup**: Implement auth context and login flow
6. **Testing**: Run comprehensive testing on all views
7. **Performance Testing**: Verify no performance regressions
8. **User Acceptance Testing**: Validate with stakeholders
9. **Production Deployment**: Deploy to staging first, then production

### Rollback Plan

In case of issues:

1. **Immediate Rollback**: Switch import back to `useInstantData`
2. **Database Rollback**: Restore InstantDB environment variables
3. **Package Rollback**: Remove API client packages
4. **Testing**: Verify InstantDB functionality is restored

### Success Metrics

- [ ] All existing functionality preserved
- [ ] Performance is equal or better
- [ ] Authentication works correctly
- [ ] Real-time features work (if implemented)
- [ ] No runtime errors
- [ ] User experience is unchanged

---

## Maintenance & Updates

### Ongoing Tasks

1. **API Monitoring**: Set up monitoring for API response times
2. **Error Tracking**: Implement error tracking for API failures
3. **Performance Monitoring**: Track frontend performance metrics
4. **Security Updates**: Keep authentication tokens secure
5. **Documentation**: Update API documentation as needed

### Future Enhancements

- Implement caching strategies
- Add offline support
- Optimize API queries
- Add real-time collaboration features
- Implement advanced filtering and search

---

## Conclusion

This migration guide provides a comprehensive roadmap for transitioning from InstantDB to Laravel API while preserving all the superior frontend functionality. The key advantage of this approach is the minimal changes required to existing components, making it a low-risk migration with high rewards.

The clean architecture with a single data-fetching hook makes this transition straightforward and maintainable. By following this guide, you'll have a production-ready application with the benefits of your proven Laravel backend and superior Next.js frontend. 