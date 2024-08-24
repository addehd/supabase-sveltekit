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
};

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {

  const { data: rooms } = await supabase.from('rooms').select().eq('exhibition_id', params.slug);
  // get data from walls wit  

  return { 
    rooms: rooms,
  };
};