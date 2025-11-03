import { db } from '../client';

export interface SevisBatch {
  id: string;
  batchNumber: string;
  status: string;
  numberOfParticipants: number;
  successfulRecords: number;
  failedRecords: number;
  program: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SevisBatchParticipant {
  id: string;
  batchId: string;
  name: string;
  changeType: string;
  result: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook to fetch all SEVIS batches from InstantDB
 * Provides real-time updates and offline-first functionality
 */
export function useSevisBatches() {
  // Return empty data if InstantDB client is not available
  if (!db) {
    console.warn('InstantDB client not available');
    return {
      data: { sevisBatches: [], sevisBatchParticipants: [] },
      error: null,
      isLoading: false,
      batches: [],
      participants: []
    };
  }

  // Use InstantDB reactive query for real-time SEVIS batch data
  const result = db.useQuery({
    sevisBatches: {},
    sevisBatchParticipants: {}
  });

  // Transform the data
  const batches = (result.data?.sevisBatches || []).map((batch: any) => ({
    id: batch.id,
    batchNumber: batch.batchNumber,
    status: batch.status,
    numberOfParticipants: batch.numberOfParticipants,
    successfulRecords: batch.successfulRecords,
    failedRecords: batch.failedRecords,
    program: batch.program,
    createdBy: batch.createdBy,
    createdAt: batch.createdAt ? new Date(batch.createdAt) : new Date(),
    updatedAt: batch.updatedAt ? new Date(batch.updatedAt) : new Date()
  }));

  const participants = (result.data?.sevisBatchParticipants || []).map((participant: any) => ({
    id: participant.id,
    batchId: participant.batchId,
    name: participant.name,
    changeType: participant.changeType,
    result: participant.result,
    message: participant.message,
    createdAt: participant.createdAt ? new Date(participant.createdAt) : new Date(),
    updatedAt: participant.updatedAt ? new Date(participant.updatedAt) : new Date()
  }));

  // Group participants by batch for convenience
  const batchesWithParticipants = batches.map(batch => ({
    ...batch,
    participantRecords: participants.filter(p => p.batchId === batch.id)
  }));

  return {
    data: result.data || { sevisBatches: [], sevisBatchParticipants: [] },
    error: result.error || null,
    isLoading: result.isLoading || false,
    batches: batchesWithParticipants,
    participants
  };
}

/**
 * Hook to fetch a specific SEVIS batch by ID
 */
export function useSevisBatch(batchId: string) {
  if (!db) {
    console.warn('InstantDB client not available');
    return {
      data: { sevisBatches: [], sevisBatchParticipants: [] },
      error: null,
      isLoading: false,
      batch: null,
      participants: []
    };
  }

  // Use InstantDB reactive query with where condition
  const result = db.useQuery({
    sevisBatches: {
      $: {
        where: {
          id: batchId
        }
      }
    },
    sevisBatchParticipants: {
      $: {
        where: {
          batchId: batchId
        }
      }
    }
  });

  const batch = result.data?.sevisBatches?.[0] || null;
  const participants = result.data?.sevisBatchParticipants || [];

  return {
    data: result.data || { sevisBatches: [], sevisBatchParticipants: [] },
    error: result.error || null,
    isLoading: result.isLoading || false,
    batch,
    participants
  };
} 