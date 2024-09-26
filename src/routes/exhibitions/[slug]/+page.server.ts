import type { PageServerLoad } from './$types';
import { checkAuthentication } from '$lib/helper';

export const actions = {
  
  submit_exhibition: async ({ request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);

      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const formData = await request.formData();
      const title = formData.get('title') || '';
      const description = formData.get('description') || '';
      const image = formData.get('image');
      const artistId = formData.get('artist_id');
      const position = formData.get('position');

      let imageUrl = '';

      if (image && image.size > 0) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${title}-${Date.now()}.${fileExt}`;
        const filePath = `exhibitions/${fileName}`;

        const { data: storageData, error: storageError } = await supabaseClient.storage
          .from('bucket')
          .upload(filePath, image);

        if (storageError) {
          console.error('Error uploading image:', storageError);
          return { success: false, error: storageError.message };
        }

        const { data: publicUrlData, error: publicUrlError } = await supabaseClient.storage
          .from('bucket')
          .getPublicUrl(filePath);

        if (publicUrlError) {
          console.error('Error generating public URL:', publicUrlError);
          return { success: false, error: publicUrlError.message };
        }

        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabaseClient
        .from('artworks')
        .insert({
          title,
          description,
          wall: position.toLowerCase(),
          room: 'hangaren',
          exhibitions_id: 32,
          artist_id: artistId,
          image_url: imageUrl || '',
        })
        .select();

      if (error) {
        console.error('Error inserting exhibition:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error during exhibition submission:', error);
      return { success: false, error: error.message };
    }
  },
  
  update_artwork: async ({ request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);

      const formData = await request.formData();
      const artworkId = formData.get('artwork_id');
      const title = formData.get('title');
      const artistId = formData.get('artist_id');
      const creationYear = formData.get('creation_year');
      const medium = formData.get('medium');
      const room = formData.get('room');
      const description = formData.get('description');
      const imageUrl = formData.get('image_url');
      const sound = formData.get('sound');
      const wall = formData.get('wall');
      const exhibitionsId = formData.get('exhibitions_id');

      const { data, error } = await supabaseClient
        .from('artworks')
        .update({
          title,
          artist_id: artistId,
          creation_year: creationYear,
          medium,
          room,
          description,
          image_url: imageUrl,
          sound,
          wall,
          exhibitions_id: exhibitionsId,
        })
        .eq('artwork_id', artworkId)
        .select();

      if (error) {
        console.error('Error updating artwork:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error during artwork update:', error);
      return { success: false, error: error.message };
    }
  }
};

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('exhibitions_id', params.slug)
    .order('artwork_id', { ascending: true });

  console.log(artworks);  

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
  
  return { artworks, artists };
};