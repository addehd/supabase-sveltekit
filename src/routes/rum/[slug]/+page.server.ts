import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({params, locals: { supabase } }) => {


  const exhibitionId = params.slug;

  const { data: exhibition } = await supabase
    .from('exhibitions')
    .select()
    .eq('id', exhibitionId)
    .single();

  const { data: artworks } = await supabase
    .from('artworks')
    .select()
    .eq('exhibitions_id', exhibitionId)
    .order('order', { ascending: true })

  return { 
    exibitions: exhibition ?? [],
    artworks: artworks ?? []
  };
};