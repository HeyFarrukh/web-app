import supabase from '@/config/supabase';
import { TrackedApprenticeship } from '@/components/profile/ProfileDashboard';

const TABLE_NAME = 'apprenticeship_progress';

export const apprenticeshipProgressService = {
  async getUserProgress(userId: string): Promise<TrackedApprenticeship[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addProgress(userId: string, app: Omit<TrackedApprenticeship, 'id'>): Promise<TrackedApprenticeship | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...app, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProgress(id: string, updates: Partial<TrackedApprenticeship>): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async deleteProgress(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
