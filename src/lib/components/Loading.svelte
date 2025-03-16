<script lang="ts">
  import { artworkLoaded } from '$lib/stores/loading-store';
  import { onMount } from 'svelte';

  // derive showDiv from artworkLoaded store
  $: showDiv = !$artworkLoaded;

  onMount(() => {
    // add active class to svgs
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });

    // auto hide after delay
    setTimeout(() => {
      $artworkLoaded = true;
    }, 0);
  });
</script>

{#if showDiv}
  <div class="fixed inset-0 bg-black flex items-center justify-center z-[720]">
    <div class="w-[20rem] h-[10rem]">
      <div class="rotate-[-90deg] z-[1000] sm:rotate-0">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
          xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" 
          viewBox="0 0 1319.2 756" 
          style="enable-background:new 0 0 1319.2 756;" 
          xml:space="preserve">
          <style type="text/css">
            .st0{fill:#FFFFFF;}
          </style>
          <g>
            <img src="/hangare-top.svg" alt="loading" />
          </g>
        </svg>
      </div>
    </div>
  </div>
{/if}
