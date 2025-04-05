
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';

export interface BoardOption {
  id: string;
  name: string;
}

export interface BatchOption {
  id: string;
  name: string;
}

export const fetchBoards = async (): Promise<BoardOption[]> => {
  // In a real application, this would fetch from a boards table
  // For now, we'll return some mock data
  return [
    { id: 'CBSE', name: 'CBSE' },
    { id: 'ICSE', name: 'ICSE' },
    { id: 'State', name: 'State Board' }
  ];
};

export const fetchBatches = async (): Promise<BatchOption[]> => {
  // In a real application, this would fetch from a batches table
  // For now, we'll return some mock data
  return [
    { id: 'A', name: 'Batch A' },
    { id: 'B', name: 'Batch B' },
    { id: 'C', name: 'Batch C' }
  ];
};

export const getMockBoards = (): BoardOption[] => {
  return [
    { id: 'CBSE', name: 'CBSE' },
    { id: 'ICSE', name: 'ICSE' },
    { id: 'State', name: 'State Board' }
  ];
};

export const getMockBatches = (): BatchOption[] => {
  return [
    { id: 'A', name: 'Batch A' },
    { id: 'B', name: 'Batch B' },
    { id: 'C', name: 'Batch C' }
  ];
};

