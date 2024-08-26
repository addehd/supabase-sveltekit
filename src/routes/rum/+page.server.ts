import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: exhibitions } = await supabase.from('exhibitions').select();
  const { data: artworks } = await supabase.from('artworks').select();

  return { 
    exibitions: exhibitions ?? [],
    artworks: artworks ?? []
  };
};