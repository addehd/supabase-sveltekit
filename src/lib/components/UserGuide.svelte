<script lang="ts">
  import { onMount } from 'svelte';
  
  let showGuide = true;
  
  const hideGuide = () => {
    showGuide = false;
  };
  
  // show guide again when pressing 'h'
  onMount(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h') showGuide = !showGuide;
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });
</script>

{#if showGuide}
<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center text-white">
  <div class="max-w-md p-6 rounded-lg">
    <h2 class="text-lg font-bold mb-4">hur du navigerar</h2>
    
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-medium mb-2">tangentbordskontroller</h3>
        <ul class="space-y-1 text-sm">
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">w</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">a</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">s</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">d</kbd> - förflytta dig</li>
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">space</kbd> - hoppa</li>
          <li>• mus - se dig omkring</li>
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">h</kbd> - visa/dölj guide</li>
        </ul>
      </div>

      {#if /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}
      <div>
        <h3 class="text-sm font-medium mb-2">mobilkontroller</h3>
        <ul class="space-y-1 text-sm">
          <li>• vänster joystick - förflytta dig</li>
          <li>• höger område - se dig omkring</li>
        </ul>
      </div>
      {/if}

      <div>
        <h3 class="text-sm font-medium mb-2">funktioner</h3>
        <ul class="space-y-1 text-sm">
          <li>• gå nära konstverk för att se detaljer</li>
          <li>• klicka på smiley för ljudguide</li>
          <li>• klicka på konstnärens namn för att se mer information</li>
          <li>• klicka på emojis som dycker up</li>
        </ul>
      </div>
    </div>

    <button  
      on:click={hideGuide}
      class="mt-6 px-4 py-1.5 bg-purple-500 hover:bg-purple-600 rounded transition-colors text-sm"
    >
      jag förstår
    </button>
  </div>
</div>
{/if} 