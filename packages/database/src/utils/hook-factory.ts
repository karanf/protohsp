// This file is deprecated - replaced by InstantDB hooks
// 
// ⚠️ DEPRECATED: This entire file has been replaced by InstantDB
// 
// Use the new InstantDB hooks from:
// - packages/database/src/hooks/users.ts
// - packages/database/src/hooks/index.ts
//
// InstantDB provides automatic real-time updates and offline-first functionality
// which makes these manual hook factories unnecessary.

import { useState, useEffect, useCallback } from 'react';
// This file is deprecated - replaced by InstantDB hooks
// import type { PostgrestError } from '@supabase/supabase-js';
// import type { Database } from '../schema/generated';

// Legacy types - kept for reference
type LegacyTableName = string; // Previously keyof Database['public']['Tables']

/**
 * @deprecated This factory function is no longer used with InstantDB
 * Use the new InstantDB hooks from packages/database/src/hooks/
 */
export function createEntityHook<T extends { id: string }>(tableName: string) {
  console.warn('createEntityHook is deprecated - use InstantDB hooks instead');
  
  return function useEntity() {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      setError(new Error('This hook is deprecated. Please use InstantDB hooks from packages/database/src/hooks/'));
      setLoading(false);
    }, []);

    return {
      data,
      loading,
      error,
      fetchAll: () => console.warn('Use InstantDB hooks instead'),
      fetchById: () => console.warn('Use InstantDB hooks instead'),
      create: () => console.warn('Use InstantDB hooks instead'),
      update: () => console.warn('Use InstantDB hooks instead'),
      remove: () => console.warn('Use InstantDB hooks instead'),
    };
  };
}

/**
 * @deprecated This factory function is no longer used with InstantDB
 * Use the new InstantDB hooks from packages/database/src/hooks/
 */
export function createResourceHook<T>(tableName: LegacyTableName) {
  console.warn('createResourceHook is deprecated - use InstantDB hooks instead');
  
  function useList() {
    return { 
      data: null, 
      error: new Error('Deprecated - use InstantDB hooks'), 
      loading: false, 
      refetch: () => {} 
    };
  }

  function useById() {
    return { 
      data: null, 
      error: new Error('Deprecated - use InstantDB hooks'), 
      loading: false, 
      refetch: () => {} 
    };
  }

  function useCreate() {
    return { 
      create: () => console.warn('Use InstantDB hooks instead'),
      loading: false,
      error: null
    };
  }

  function useUpdate() {
    return { 
      update: () => console.warn('Use InstantDB hooks instead'),
      loading: false,
      error: null
    };
  }

  function useDelete() {
    return { 
      deleteItem: () => console.warn('Use InstantDB hooks instead'),
      loading: false,
      error: null
    };
  }

  return {
    useList,
    useById,
    useCreate,
    useUpdate,
    useDelete,
  };
} 