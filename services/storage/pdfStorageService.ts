import supabase from '../../config/supabase';

export const pdfStorageService = {
  async uploadPdf(file: File, userId: string): Promise<{ path: string; error: Error | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload to storage with explicit owner metadata
      const { data, error } = await supabase.storage
        .from('cv-pdfs')
        .upload(fileName, file, {
          upsert: false
        });

      if (error) throw error;

      // Insert record into user_pdfs table
      const { error: dbError } = await supabase
        .from('user_pdfs')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_url: data.path
        });

      if (dbError) throw dbError;

      return { path: data.path, error: null };
    } catch (error) {
      console.error('Error uploading PDF:', error);
      return { path: '', error: error as Error };
    }
  },

  async getUserPdfs(userId: string) {
    const { data, error } = await supabase
      .from('user_pdfs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deletePdf(path: string, userId: string) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('cv-pdfs')
        .remove([path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_pdfs')
        .delete()
        .eq('file_url', path)
        .eq('user_id', userId);

      if (dbError) throw dbError;

      return { error: null };
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return { error };
    }
  }
};
