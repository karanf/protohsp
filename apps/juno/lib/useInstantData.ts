'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '@repo/database';

// Efficient shallow equality check for objects
function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

// Optimized transformation functions
function transformUsers(users: any[]): User[] {
  return users.map((user: any) => {
    const now = new Date();
    return {
      id: user.id,
      email: user.email || '',
      role: user.role || '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status || 'active',
      metadata: user.metadata,
      lastSignIn: user.lastSignIn ? new Date(user.lastSignIn) : undefined,
      createdAt: user.createdAt ? new Date(user.createdAt) : now,
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : now,
    };
  });
}

function transformProfiles(profiles: any[]): Profile[] {
  return profiles.map((profile: any) => {
    const now = new Date();
    return {
      id: profile.id,
      userId: profile.userId || '',
      type: profile.type || '',
      data: profile.data || {},
      status: profile.status || 'active',
      verified: profile.verified || false,
      verificationDate: profile.verificationDate ? new Date(profile.verificationDate) : undefined,
      createdAt: profile.createdAt ? new Date(profile.createdAt) : now,
      updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : now,
    };
  });
}

function transformRelationships(relationships: any[]): Relationship[] {
  return relationships.map((rel: any) => {
    const now = new Date();
    return {
      id: rel.id,
      type: rel.type || '',
      primaryId: rel.primaryId || '',
      secondaryId: rel.secondaryId || '',
      status: rel.status || 'active',
      startDate: rel.startDate ? new Date(rel.startDate) : undefined,
      endDate: rel.endDate ? new Date(rel.endDate) : undefined,
      data: rel.data,
      createdAt: rel.createdAt ? new Date(rel.createdAt) : now,
      updatedAt: rel.updatedAt ? new Date(rel.updatedAt) : now,
    };
  });
}

// InstantDB Data Hook
// Replaces the original Supabase data fetching logic

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
  endDate?: Date;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface InstantDBData {
  users: User[];
  profiles: Profile[];
  relationships: Relationship[];
  isLoading: boolean;
  error: string | null;
  usedFallback?: boolean;
  usingServiceClient?: boolean;
}

/**
 * Hook to fetch data from InstantDB
 * This replaces the original useSupabaseData hook
 */
export function useInstantData(): InstantDBData {
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to store previous data for comparison
  const prevDataRef = useRef<any>(null);
  const transformedDataRef = useRef<{
    users: User[];
    profiles: Profile[];
    relationships: Relationship[];
  } | null>(null);

  // Check if InstantDB client is available
  if (!db) {
    console.error('❌ InstantDB client not available - check your environment variables');
    return {
      users: [],
      profiles: [],
      relationships: [],
      isLoading: false,
      error: 'InstantDB client not available - check your environment variables',
      usedFallback: true,
      usingServiceClient: false
    };
  }

  try {
    // Use InstantDB's reactive query system
    const { data, isLoading, error: queryError } = db.useQuery({
      users: {},
      profiles: {},
      relationships: {}
    });

    // Handle query error
    if (queryError) {
      console.error('❌ InstantDB query error:', queryError);
      return {
        users: [],
        profiles: [],
        relationships: [],
        isLoading: false,
        error: queryError.message || 'Failed to load data from InstantDB',
        usedFallback: true,
        usingServiceClient: false
      };
    }

    // Memoize the transformed data with efficient shallow comparison
    const transformedData = useMemo(() => {
      // If data hasn't changed, return the cached version
      if (prevDataRef.current && 
          shallowEqual(data, prevDataRef.current) &&
          transformedDataRef.current) {
        return transformedDataRef.current;
      }

      // Data has changed, transform it efficiently
      const newTransformedData = {
        users: transformUsers(data?.users || []),
        profiles: transformProfiles(data?.profiles || []),
        relationships: transformRelationships(data?.relationships || []),
      };

      // Update refs
      prevDataRef.current = data;
      transformedDataRef.current = newTransformedData;

      return newTransformedData;
    }, [data]); // Only depend on the data object itself

    // Use natural InstantDB loading state without artificial delays
    return {
      ...transformedData,
      isLoading: isLoading,
      error: null,
      usedFallback: false,
      usingServiceClient: false
    };
  } catch (err) {
    console.error('Failed to fetch InstantDB data:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to load data from InstantDB';
    
    return {
      users: [],
      profiles: [],
      relationships: [],
      isLoading: false,
      error: errorMessage,
      usedFallback: true,
      usingServiceClient: false
    };
  }
} 