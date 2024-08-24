export async function checkAuthentication(locals) {
  const supabaseClient = locals.supabase;
  if (!supabaseClient) {
    throw new Error('Not authenticated');
  }

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return { supabaseClient, user };
}