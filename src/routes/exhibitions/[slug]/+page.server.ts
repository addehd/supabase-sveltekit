import type { PageServerLoad } from './$types'

// update room
export const actions = {
  update_room: async ({ request, locals }) => {

    console.log('locals', locals);

    const supabaseClient = locals.supabase;
    if (!supabaseClient) {
      console.error('Supabase client not found in locals');
      return { success: false, error: 'Not authenticated' };
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    console.log('user', user);

    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

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
  },
};

export const load: PageServerLoad = async ({params, locals: { supabase } }) => {

  const { slug } = params
  const { data: rooms } = await supabase.from('rooms').select().eq('slug', slug).single()
  const { data: artists } = await supabase.from('artists').select()

  return { 
    artists : artists ?? [],
    rum: rooms
  }
}