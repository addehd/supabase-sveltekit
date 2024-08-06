<script lang="ts">
  import { supabase } from '$lib/supabase'
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte'
  import "../app.css";
  
  onMount(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => { 
      invalidate('supabase:auth')
    })
    return () => {
      subscription.unsubscribe()
    }
  })
  </script>
  
  <main class="dark:bg-gray-900 min-h-[100vh]">
    <slot />
  </main>