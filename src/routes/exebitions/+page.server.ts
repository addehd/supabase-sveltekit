import type { PageServerLoad } from './$types'

// submit exhibition
export const actions = {
  submit_exhibition: async ({ request, locals }) => {

    console.log('locals', locals);

    const supabaseClient = locals.supabase;
    if (!supabaseClient) {
      console.error('Supabase client not found in locals');
      return { success: false, error: 'Not authenticated' };
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    console.log('userrr', user);

    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const image = formData.get('image');

    // image upload
    const fileExt = image.name.split('.').pop();
    const fileName = `${name}-${Date.now()}.${fileExt}`;
    const filePath = `bucket/${fileName}`;

    const { data: storageData, error: storageError } = await supabaseClient.storage
      .from('bucket')
      .upload(filePath, image);

    console.log('storageData', storageData);

    if (storageError) {
      console.error('Error uploading image:', storageError);
      return { success: false, error: storageError.message };
    }

    const imageUrl = supabaseClient.storage
      .from('exhibition-images')
      .getPublicUrl(filePath).data.publicUrl;


    const { data, error } = await supabaseClient
      .from('exhibitions')
      .insert([
        {
          title: name,
          description: description,
          start_date: new Date(),
          end_date: new Date(),
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  },
};

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: exhibitions } = await supabase.from('exhibitions').select()
  return { exibitions: exhibitions ?? [] }
}