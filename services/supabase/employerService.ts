import supabase from '@/config/supabase';

export interface Employer {
  id: string;
  name: string;
  website_url: string | null;
  logo_url: string | null;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  is_verified: boolean;
  is_disability_confident: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const employerService = {
  async getEmployerByName(name: string): Promise<Employer | null> {
    const { data, error } = await supabase
      .from("employers")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      console.error("Error fetching employer:", error);
      return null;
    }

    return data;
  },

  async getVerifiedEmployers(): Promise<Employer[]> {
    const { data, error } = await supabase
      .from("employers")
      .select("*")
      .eq("is_verified", true);

    if (error) {
      console.error("Error fetching verified employers:", error);
      return [];
    }

    return data || [];
  }
};
