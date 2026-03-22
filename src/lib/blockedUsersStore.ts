import { supabase } from '@/integrations/supabase/client';

export interface BlockedUser {
  id: string;
  email: string;
  blocked_at: string | null;
  blocked_by: string | null;
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('*')
    .order('blocked_at', { ascending: false });
  if (error) {
    console.error('Error fetching blocked users:', error);
    return [];
  }
  return data || [];
}

export async function isUserBlocked(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error('Error checking blocked status:', error);
    return false;
  }
  return !!data;
}

export async function blockUser(email: string, blockedBy: string): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .insert([{ email: email.toLowerCase(), blocked_by: blockedBy }]);
  if (error) throw error;
}

export async function unblockUser(email: string): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('email', email.toLowerCase());
  if (error) throw error;
}
