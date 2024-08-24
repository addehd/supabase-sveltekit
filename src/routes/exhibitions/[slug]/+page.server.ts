import type { PageServerLoad } from './$types';
import { checkAuthentication } from '$lib/helper';

export const actions = {
  update_room: async ({ request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);

      const formData = await request.formData();
      const roomId = formData.get('room_id');
      const name = formData.get('name');
      const location = formData.get('location');
      const capacity = formData.get('capacity');
      const exhibitionId = formData.get('exhibition_id');

      const { data, error } = await supabaseClient
        .from('rooms')
        .update({
          name: name,
          location: location,
          capacity: capacity,
          exhibition_id: exhibitionId,
        })
        .eq('id', roomId)
        .select();

      if (error) {
        console.error('Error updating room:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error during room update:', error);
      return { success: false, error: error.message };
    }
  },
  submit_artpiece: async ({ request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);

      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const formData = await request.formData();
      const roomId = formData.get('room_id');
      const position = formData.get('position');
      const title = formData.get('title');
      const description = formData.get('description');
      const image = formData.get('image');
      const artistId = formData.get('artist_id');

      const fileExt = image.name.split('.').pop();
      const fileName = `${title}-${Date.now()}.${fileExt}`;
      const filePath = `artworks/${fileName}`;

      const { data: storageData, error: storageError } = await supabaseClient.storage
        .from('bucket')
        .upload(filePath, image);

      if (storageError) {
        console.error('Error uploading image:', storageError);
        return { success: false, error: storageError.message };
      }

      const imageUrl = supabaseClient.storage
        .from('artworks')
        .getPublicUrl(filePath).data.publicUrl;

      // Insert artwork into the database
      const { data, error } = await supabaseClient
        .from('artworks')
        .insert({
          title,
          artist_id: artistId,
          room_id: roomId,
          position,
          description,
          image_url: imageUrl,
        })
        .select();

      if (error) {
        console.error('Error inserting artwork:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error during artwork submission:', error);
      return { success: false, error: error.message };
    }
  },
};

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {

  const { data: rooms } = await supabase.from('rooms').select().eq('exhibition_id', params.slug);
  // get data from walls wit  

  return { 
    rooms: rooms,
  };
};