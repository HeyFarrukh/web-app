export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at?: string; // Optional - if you store this
  last_login?: string; // Optional - if you store this
}