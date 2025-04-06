
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';

// Define types locally to avoid circular references
export interface BatchRecord {
  id: string;
  name: string;
  created_at?: string;
}

export interface BoardRecord {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

// Get all batches
export async function fetchBatches(): Promise<BatchRecord[]> {
  try {
    // For demo/development mode, use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock batch data');
      return getMockBatches();
    }
    
    // For production mode, fetch from Supabase
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
    
    return data as BatchRecord[];
  } catch (error) {
    console.error('Error in fetchBatches:', error);
    return [];
  }
}

// Get all boards
export async function fetchBoards(): Promise<BoardRecord[]> {
  try {
    // For demo/development mode, use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock board data');
      return getMockBoards();
    }
    
    // For production mode, fetch from Supabase
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching boards:', error);
      return [];
    }
    
    return data as BoardRecord[];
  } catch (error) {
    console.error('Error in fetchBoards:', error);
    return [];
  }
}

// Create a new batch
export async function createBatch(name: string): Promise<string | null> {
  try {
    // For demo mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Would create batch:', name);
      return 'mock-batch-id';
    }
    
    const { data, error } = await supabase
      .from('batches')
      .insert({ name })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating batch:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in createBatch:', error);
    return null;
  }
}

// Create a new board
export async function createBoard(name: string, description?: string): Promise<string | null> {
  try {
    // For demo mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Would create board:', name, description);
      return 'mock-board-id';
    }
    
    const { data, error } = await supabase
      .from('boards')
      .insert({ name, description })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating board:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in createBoard:', error);
    return null;
  }
}

// Mock data functions
export function getMockBatches(): BatchRecord[] {
  return [
    { id: 'A', name: 'Batch A' },
    { id: 'B', name: 'Batch B' },
    { id: 'C', name: 'Batch C' },
    { id: 'D', name: 'Batch D' },
    { id: 'E', name: 'Batch E' }
  ];
}

export function getMockBoards(): BoardRecord[] {
  return [
    { id: 'CBSE', name: 'CBSE', description: 'Central Board of Secondary Education' },
    { id: 'ICSE', name: 'ICSE', description: 'Indian Certificate of Secondary Education' },
    { id: 'State', name: 'State Board', description: 'State Education Board' },
    { id: 'IB', name: 'IB', description: 'International Baccalaureate' }
  ];
}
