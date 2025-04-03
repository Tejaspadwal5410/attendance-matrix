
import { supabase } from '@/integrations/supabase/client';

export async function fetchClasses(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
    if (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}
