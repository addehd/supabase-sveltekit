import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({params, locals: { supabase } }) => {


  const exhibitionId = params.slug;

  const { data: exhibitions } = await supabase.from('exhibitions').select();
  const { data: artworks } = await supabase.from('artworks').select();

  console.log(artworks);


  return { 
    exibitions: exhibitions ?? [],
    artworks: artworks ?? []
  };
};