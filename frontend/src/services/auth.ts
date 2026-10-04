import { getSupabaseClient } from '../lib/supabase';

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signUp({ email, password });

  if (error) throw error;

  return data;
}