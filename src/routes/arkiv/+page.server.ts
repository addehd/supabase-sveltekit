import type { PageServerLoad } from './$types';
import { checkAuthentication } from '$lib/helper';

// submit exhibition
export const actions = {
  submit_exhibition: async ({ request, locals }) => {
    const { supabaseClient, user } = await checkAuthentication(locals);
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
  
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const room = formData.get('room') || 'hangaren'; // Default to hangaren if not specified
    const image = formData.get('image');
    const video = formData.get('video'); // Get video URL
  
    const fileExt = image.name.split('.').pop();
    const fileName = `${name}-${Date.now()}.${fileExt}`;
    const filePath = `exhibition-images/${fileName}`;
  
    const { data: storageData, error: storageError } = await supabaseClient.storage
      .from('bucket')
      .upload(filePath, image);
  
    if (storageError) {
      console.error('Error uploading image:', storageError);
      return { success: false, error: storageError.message };
    }
  
    const { data: publicUrlData, error: publicUrlError } = supabaseClient.storage
      .from('bucket')
      .getPublicUrl(filePath);
  
    if (publicUrlError) {
      console.error('Error generating public URL:', publicUrlError);
      return { success: false, error: publicUrlError.message };
    }
  
    const imageUrl = publicUrlData.publicUrl;
  
    const { data: exhibition_data, error } = await supabaseClient
      .from('exhibitions')
      .insert([
        {
          title: name,
          description: description,
          start_date: new Date(),
          end_date: new Date(),
          image_url: imageUrl,
          default_room: room, // Store the selected room as the default
          video: video, // Add video URL to the insert
        },
      ])
      .select();
  
    if (error) {
      console.error('Error inserting exhibition data:', error);
      return { success: false, error: error.message };
    }

    const exhibitionId = exhibition_data[0].exhibition_id;
  
    const { data: room_data, error: roomError } = await supabaseClient
      .from('rooms')
      .insert([
        { name: 'hangaren', exhibition_id: exhibitionId, is_default: room === 'hangaren' },
        { name: 'stappen', exhibition_id: exhibitionId, is_default: room === 'stappen' },
      ])
      .select();
  
    if (roomError) {
      console.error('Error inserting rooms:', roomError);
      return { success: false, error: roomError.message };
    }
  
    return { success: true, exhibition_data };
  },
  
  edit_exhibition: async ({ request, locals }) => {
    const { supabaseClient } = await checkAuthentication(locals);

    const formData = await request.formData();

    const exhibition_id = parseInt(formData.get('exhibition_id'), 10);
    const name = formData.get('name');
    const description = formData.get('description');
    const video = formData.get('video'); // Get video URL from form data

    if (isNaN(exhibition_id)) {
      return { success: false, error: 'Invalid exhibition ID' };
    }

    const { error } = await supabaseClient
      .from('exhibitions')
      .update({ title: name, description: description, video: video }) // Add video to update
      .eq('exhibition_id', exhibition_id);

    if (error) {
      console.error('Error updating exhibition:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  delete_exhibition: async ({ request, locals }) => {
    const { supabaseClient } = await checkAuthentication(locals);

    const formData = await request.formData();
    const exhibition_id = parseInt(formData.get('exhibition_id'), 10);

    if (isNaN(exhibition_id)) {
      return { success: false, error: 'Invalid exhibition ID' };
    }

    // directly delete the exhibition - cascade will handle related records
    const { error: exhibitionError } = await supabaseClient
      .from('exhibitions')
      .delete()
      .eq('exhibition_id', exhibition_id);

    if (exhibitionError) {
      console.error('Error deleting exhibition:', exhibitionError);
      return { success: false, error: exhibitionError.message };
    }

    return { success: true };
  }
};

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: exhibitions } = await supabase.from('exhibitions').select();

  console.log(exhibitions);
  
  return { exibitions: exhibitions ?? [] };
};