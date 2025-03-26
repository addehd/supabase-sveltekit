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
    <h2 class="text-lg font-bold mb-4">how to navigate</h2>
    
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-medium mb-2">keyboard controls</h3>
        <ul class="space-y-1 text-sm">
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">w</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">a</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">s</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">d</kbd> - move around</li>
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">space</kbd> - jump</li>
          <li>• mouse - look around</li>
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">h</kbd> - toggle this guide</li>
        </ul>
      </div>

      {#if /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}
      <div>
        <h3 class="text-sm font-medium mb-2">mobile controls</h3>
        <ul class="space-y-1 text-sm">
          <li>• left joystick - move around</li>
          <li>• right area - look around</li>
        </ul>
      </div>
      {/if}

      <div>
        <h3 class="text-sm font-medium mb-2">features</h3>
        <ul class="space-y-1 text-sm">
          <li>• approach artworks to view details</li>
          <li>• click smiley button for audio guide</li>
          <li>• use day/night toggle to change lighting</li>
        </ul>
      </div>
    </div>

    <button 
      on:click={hideGuide}
      class="mt-6 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm"
    >
      got it
    </button>
  </div>
</div>
{/if} 