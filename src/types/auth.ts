export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at?: string;
  last_login?: string;
  last_logout?: string;
}