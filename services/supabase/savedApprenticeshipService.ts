import supabase from '@/config/supabase';
import { ListingType } from '@/types/listing';
import { vacancyService } from './vacancyService';
import { Analytics } from '@/services/analytics/analytics';

interface SavedApprenticeship {
  id: string;
  user_id: string;
  vacancy_id: string;
  created_at: string;
}

class SavedApprenticeshipService {
  private readonly TABLE_NAME = 'saved_apprenticeships';

  async saveApprenticeship(userId: string, vacancyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .upsert({
          user_id: userId,
          vacancy_id: vacancyId,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,vacancy_id',
          ignoreDuplicates: true,
        });

      if (error) {
        console.error('[SavedApprenticeshipService] Error saving apprenticeship:', error);
        Analytics.event('error', 'save_apprenticeship_error', error.message);
        throw error;
      }

      Analytics.event('user_action', 'apprenticeship_saved', vacancyId);
      return true;
    } catch (error) {
      console.error('[SavedApprenticeshipService] Error saving apprenticeship:', error);
      return false;
    }
  }

  async unsaveApprenticeship(userId: string, vacancyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('user_id', userId)
        .eq('vacancy_id', vacancyId);

      if (error) {
        console.error('[SavedApprenticeshipService] Error unsaving apprenticeship:', error);
        Analytics.event('error', 'unsave_apprenticeship_error', error.message);
        throw error;
      }

      Analytics.event('user_action', 'apprenticeship_unsaved', vacancyId);
      return true;
    } catch (error) {
      console.error('[SavedApprenticeshipService] Error unsaving apprenticeship:', error);
      return false;
    }
  }

  async isApprenticeshipSaved(userId: string, vacancyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .eq('vacancy_id', vacancyId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        console.error('[SavedApprenticeshipService] Error checking if apprenticeship is saved:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[SavedApprenticeshipService] Error checking if apprenticeship is saved:', error);
      return false;
    }
  }

  async getSavedApprenticeships(userId: string): Promise<ListingType[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('vacancy_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SavedApprenticeshipService] Error getting saved apprenticeships:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Get the vacancy details for each saved apprenticeship
      const vacancyIds = data.map(item => item.vacancy_id);
      const vacancies: ListingType[] = [];

      for (const id of vacancyIds) {
        const vacancy = await vacancyService.getVacancyById(id);
        if (vacancy) {
          vacancies.push(vacancy);
        }
      }

      return vacancies;
    } catch (error) {
      console.error('[SavedApprenticeshipService] Error getting saved apprenticeships:', error);
      return [];
    }
  }

  async removeAllSavedApprenticeships(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('user_id', userId);
  
      if (error) {
        console.error('[SavedApprenticeshipService] Error removing all saved apprenticeships:', error);
        Analytics.event('error', 'remove_all_apprenticeships_error', error.message);
        throw error;
      }
  
      Analytics.event('user_action', 'all_apprenticeships_removed', userId);
      return true;
    } catch (error) {
      console.error('[SavedApprenticeshipService] Error removing all saved apprenticeships:', error);
      return false;
    }
  }
}

export const savedApprenticeshipService = new SavedApprenticeshipService();
