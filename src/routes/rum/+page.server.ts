import type { PageServerLoad } from './$types'


export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: artists } = await supabase.from('artists').select()
  return { artists : artists ?? [] }
}