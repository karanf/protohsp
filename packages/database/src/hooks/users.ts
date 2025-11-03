import { db } from '../client';
import { useCallback } from 'react';

/**
 * Hook to fetch and manage users with InstantDB
 * Provides real-time updates and offline-first functionality
 */
export function useUsers() {
  // Return empty data if InstantDB client is not available
  if (!db) {
    console.warn('InstantDB client not available');
    return {
      data: { users: [] },
      error: null,
      isLoading: false
    };
  }

  // Use InstantDB reactive query for real-time user data
  const result = db.useQuery({
    users: {
      profiles: {} // Include user profiles
    }
  });

  return {
    data: result.data || { users: [] },
    error: result.error || null,
    isLoading: result.isLoading || false
  };
}

/**
 * Hook to fetch a specific user by ID
 */
export function useUser(userId: string) {
  if (!db) {
    console.warn('InstantDB client not available');
    return {
      data: { users: [] },
      error: null,
      isLoading: false
    };
  }

  // Use InstantDB reactive query with where condition
  const result = db.useQuery({
    users: {
      $: {
        where: {
          id: userId
        }
      },
      profiles: {} // Include user profiles
    }
  });

  return {
    data: result.data || { users: [] },
    error: result.error || null,
    isLoading: result.isLoading || false,
    user: result.data?.users?.[0] || null
  };
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const createUser = async (userData: {
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: string;
  }) => {
    if (!db) {
      throw new Error('InstantDB client not available');
    }

    const userId = crypto.randomUUID();
    const now = new Date();

    try {
      if (!db.tx?.users) {
        throw new Error('Database transaction not available');
      }
      
      const userTransaction = db.tx.users[userId]?.update({
        id: userId,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        status: userData.status || 'active',
        createdAt: now,
        updatedAt: now
      });

      if (!userTransaction) {
        throw new Error('Failed to create user transaction');
      }
      
      await db.transact([userTransaction]);

      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  return { createUser };
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const updateUser = async (userId: string, updates: {
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: string;
  }) => {
    if (!db) {
      throw new Error('InstantDB client not available');
    }

    try {
      if (!db.tx?.users) {
        throw new Error('Database transaction not available');
      }

      const userEntity = db.tx.users[userId];
      if (!userEntity) {
        throw new Error(`User entity not found for ID: ${userId}`);
      }
      
      const updateTransaction = userEntity.update({
        ...updates,
        updatedAt: new Date()
      });

      if (!updateTransaction) {
        throw new Error('Failed to create update transaction');
      }
      
      await db.transact([updateTransaction]);

      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return { updateUser };
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const deleteUser = async (userId: string) => {
    if (!db) {
      throw new Error('InstantDB client not available');
    }

    try {
      if (!db.tx?.users) {
        throw new Error('Database transaction not available');
      }

      const userEntity = db.tx.users[userId];
      if (!userEntity) {
        throw new Error(`User entity not found for ID: ${userId}`);
      }
      
      const deleteTransaction = userEntity.delete();

      if (!deleteTransaction) {
        throw new Error('Failed to create delete transaction');
      }
      
      await db.transact([deleteTransaction]);

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  return { deleteUser };
}

// Removed duplicate functions with type errors 