import { supabase } from '@/integrations/supabase/client';

export interface VisitRecord {
  id: string;
  user_id: string | null;
  college: string | null;
  program: string | null;
  reason: string | null;
  created_at: string | null;
}

export async function getAllVisits(): Promise<VisitRecord[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching visits:', error);
    return [];
  }
  return data || [];
}

export async function getVisitsByUserId(userId: string): Promise<VisitRecord[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching visits by user:', error);
    return [];
  }
  return data || [];
}

export async function addVisit(visit: { user_id: string; college: string; program: string; reason: string }) {
  const { data, error } = await supabase
    .from('visits')
    .insert([visit])
    .select();
  if (error) {
    console.error('Error inserting visit:', error);
    throw error;
  }
  return data;
}

export async function updateVisit(id: string, updates: { reason?: string; college?: string; program?: string }) {
  const { error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating visit:', error);
    throw error;
  }
}

export async function deleteVisit(id: string) {
  const { error } = await supabase
    .from('visits')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting visit:', error);
    throw error;
  }
}
