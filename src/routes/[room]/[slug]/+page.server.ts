import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({params, locals: { supabase } }) => {

  const exhibitionId = params.slug;

  const { data: exhibition } = await supabase
    .from('exhibitions')
    .select()
    .eq('id', exhibitionId)
    .single();

  const { data: artworks } = await supabase
    .from('artworks_merged')
    .select()
    .eq('exhibitions_id', exhibitionId)
    .eq('room', params.room)
    .order('order', { ascending: true })

  return { 
    exibitions: exhibition ?? [],
    artworks: artworks ?? [],
    routeParam: params.room
  };
};