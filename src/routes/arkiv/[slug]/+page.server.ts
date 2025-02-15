import type { PageServerLoad } from './$types';
import { checkAuthentication, postAudioData } from '$lib/helper';

export const actions = {
  submit_artwork: async ({ params, request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);

      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const formData = await request.formData();
      const title = formData.get('title') || '';
      const shortDescription = formData.get('short_description') || 'hej';
      const description = formData.get('description') || '';
      const image = formData.get('image');
      const artistId = formData.get('artist_id');
      const position = formData.get('position');
      const wall = formData.get('wall');
      const room = formData.get('room');
      const order = formData.get('order');
      const slug = params.slug;

      let imageUrl = '';
      let audioUrl = '';

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

      try {
        const audioResponse = await postAudioData(title, shortDescription);
        if (audioResponse.success) {
          audioUrl = audioResponse.url;
        } else {
          throw new Error('Audio generation failed');
        }
      } catch (audioError) {
        console.error('Error fetching audio data:', audioError);
        return { success: false, error: 'Failed to generate audio' };
      }

      const { data, error } = await supabaseClient
        .from('artworks')
        .insert({
          title,
          short_description: shortDescription,
          description,
          wall: wall?.toLowerCase(),
          room: room,
          order: order,
          exhibitions_id: slug,
          artist_id: artistId,
          image_url: imageUrl || '',
          audio: audioUrl,
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
      const shortDescription = formData.get('short_description');
      const artistId = formData.get('artist_id');
      const creationYear = formData.get('creation_year');
      const medium = formData.get('medium');
      const room = formData.get('room');
      const description = formData.get('description');
      const wall = formData.get('wall');
      const exhibitionsId = formData.get('exhibition_id');

      let audioUrl = '';

      const existingArtwork = await supabaseClient
        .from('artworks')
        .select('*')
        .eq('artwork_id', artworkId)
        .single();

      console.log('existingArtwork:', existingArtwork);
      console.log('formData:', formData);
      //return { success: true };

      const currentImageUrl = existingArtwork.data.image_url;

      const newImage = formData.get('image'); // new image file

      // check if a new image is provided
      let imageUrl = currentImageUrl; // default to current image URL

      if (newImage && newImage.size > 0) {
        // handle the new image upload logic here
        const fileExt = newImage.name.split('.').pop();
        const fileName = `${title}-${Date.now()}.${fileExt}`;
        const filePath = `exhibitions/${fileName}`;

        const { data: storageData, error: storageError } = await supabaseClient.storage
          .from('bucket')
          .upload(filePath, newImage);

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

        // update the image URL with the new one
        imageUrl = publicUrlData.publicUrl;
      }

      // build update object only with changed fields
      const updates: any = {};
      const fields = ['title', 'short_description', 'artist_id', 'creation_year', 
                     'medium', 'room', 'description', 'wall', 'exhibitions_id'];
      
      fields.forEach(field => {
        const newValue = formData.get(field);
        if (newValue !== null && newValue !== existingArtwork[field]) {
          updates[field] = newValue;
        }
      });

      // handle wall case specifically
      if (updates.wall) {
        updates.wall = updates.wall.toLowerCase();
      }

      // only generate new audio if short_description changed
      if (updates.short_description) {
        try {
          const audioResponse = await postAudioData(
            formData.get('title') || existingArtwork.title,
            updates.short_description
          );
          if (audioResponse.success) {
            updates.audio = audioResponse.url;
          }
        } catch (audioError) {
          console.error('Error fetching audio data:', audioError);
        }
      }

      const { data, error } = await supabaseClient
        .from('artworks')
        .update(updates)
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
  },

  update_order: async ({ request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);
      const { updates } = await request.json();

      console.log('updates:', updates);

      // call the postgres function with the updates array
      const { data, error } = await supabaseClient
        .rpc('update_artwork_orders', {
          order_updates: updates // pass the array directly
        });

      if (error) {
        console.error('Error updating artwork orders:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating artwork orders:', error);
      return { success: false, error: error.message };
    }
  },

  delete_artwork: async ({ request, locals }) => {
    try {
      const { supabaseClient, user } = await checkAuthentication(locals);
      const formData = await request.formData();
      const artworkId = formData.get('artwork_id');

      // delete the artwork from the database
      const { error } = await supabaseClient
        .from('artworks')
        .delete()
        .eq('artwork_id', artworkId);

      if (error) {
        console.error('error deleting artwork:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('error during artwork deletion:', error);
      return { success: false, error: error.message };
    }
  }
};

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('exhibitions_id', params.slug)
    .order('order', { ascending: true });

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
  
  return { artworks, artists, exhibition_id: params.slug };
};
