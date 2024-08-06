  import { supabase } from "$lib/supabase";

  export async function load() {
    const { data } = await supabase.from("artists").select();
    console.log("tada",data);
    return {
      countries: data ?? [],
    };
  }