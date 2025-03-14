import supabase from '../../config/supabase';
import { createLogger } from '@/services/logger/logger';

const logger = createLogger({ module: 'PDFStorageService' });

export const pdfStorageService = {
  async uploadPdf(file: File, userId: string): Promise<{ path: string; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      logger.info('Starting PDF upload to Supabase storage', { 
        fileName: file.name,
        size: file.size,
        bucket: 'cv-pdfs'
      });

      // Upload to storage with explicit owner metadata
      const { data, error } = await supabase.storage
        .from('cv-pdfs')
        .upload(fileName, file, {
          upsert: false
        });

      if (error) {
        logger.error('Failed to upload PDF to storage:', error);
        throw error;
      }

      logger.info('PDF uploaded to storage successfully', { path: data.path });

      // Insert record into user_pdfs table
      const { error: dbError } = await supabase
        .from('user_pdfs')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_url: data.path
        });

      if (dbError) {
        logger.error('Failed to create PDF record in database:', dbError);
        throw dbError;
      }

      logger.info('PDF record created in database successfully');
      return { path: data.path, error: null };
    } catch (error) {
      logger.error('Error in PDF upload process:', error);
      return { path: '', error: error as Error };
    }
  },

  async getUserPdfs(userId: string) {
    try {
      logger.info('Fetching user PDFs', { userId });
      
      const { data, error } = await supabase
        .from('user_pdfs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch user PDFs:', error);
        throw error;
      }

      logger.info('Successfully fetched user PDFs', { count: data.length });
      return data;
    } catch (error) {
      logger.error('Error fetching user PDFs:', error);
      throw error;
    }
  },

  async deletePdf(path: string, userId: string) {
    try {
      logger.info('Starting PDF deletion process', { path, userId });

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('cv-pdfs')
        .remove([path]);

      if (storageError) {
        logger.error('Failed to delete PDF from storage:', storageError);
        throw storageError;
      }

      logger.info('PDF deleted from storage successfully');

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_pdfs')
        .delete()
        .eq('file_url', path)
        .eq('user_id', userId);

      if (dbError) {
        logger.error('Failed to delete PDF record from database:', dbError);
        throw dbError;
      }

      logger.info('PDF record deleted from database successfully');
      return { error: null };
    } catch (error) {
      logger.error('Error in PDF deletion process:', error);
      return { error };
    }
  }
};
