<script lang="ts">
  import { onMount } from 'svelte';
  
  let showGuide = false;
  let isMobile = false;
  
  const hideGuide = () => {
    showGuide = false;
  };
  
  onMount(() => {
    // check if mobile device
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // show guide again when pressing 'h'
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h') showGuide = !showGuide;
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });
</script>

<button class="absolute top-3 left-7 m-4 z-[1001] w-6 h-6" on:click={() => {
  showGuide = !showGuide;
}}>
  <svg width="40" height="40" viewBox="0 0 2635 2674" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M385.261 392.088C632.17 141.226 967.388 0 1317.26 0C1667.13 0 2002.35 141.226 2249.26 392.088C2496.11 642.895 2634.52 982.733 2634.52 1336.76C2634.52 1512.09 2600.53 1685.74 2534.46 1847.8C2468.39 2009.87 2371.5 2157.23 2249.26 2281.43C2127.01 2405.64 1981.8 2504.24 1821.87 2571.55C1661.94 2638.86 1490.47 2673.52 1317.26 2673.52C1144.05 2673.52 972.582 2638.86 812.649 2571.55C652.719 2504.24 507.507 2405.64 385.261 2281.43C263.019 2157.23 166.133 2009.87 100.06 1847.8C33.9875 1685.74 0 1512.09 0 1336.76C7.62939e-06 982.733 138.406 642.895 385.261 392.088ZM1317.26 198.52C1021.07 198.52 736.677 318.052 526.746 531.343C316.764 744.688 198.52 1034.38 198.52 1336.76C198.52 1486.45 227.541 1634.64 283.89 1772.86C340.237 1911.07 422.785 2036.55 526.746 2142.18C630.704 2247.8 754.035 2331.5 889.654 2388.57C1025.27 2445.65 1170.57 2475 1317.26 2475C1463.95 2475 1609.25 2445.65 1744.87 2388.57C1880.49 2331.5 2003.82 2247.8 2107.77 2142.18C2211.73 2036.55 2294.28 1911.07 2350.63 1772.86C2406.98 1634.64 2436 1486.45 2436 1336.76C2436 1034.38 2317.76 744.688 2107.77 531.343C1897.84 318.052 1613.45 198.52 1317.26 198.52Z" fill="white"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M1030 1110.64C1030 1064.93 1067.01 1027.88 1112.65 1027.88H1322.5C1368.15 1027.88 1405.15 1064.93 1405.15 1110.64V1868.35H1532.35C1577.99 1868.35 1615 1905.41 1615 1951.12C1615 1996.83 1577.99 2033.88 1532.35 2033.88H1322.5C1276.85 2033.88 1239.85 1996.83 1239.85 1951.12V1193.41H1112.65C1067.01 1193.41 1030 1156.35 1030 1110.64Z" fill="white"/> <path d="M1353 696.88C1353 764.259 1298.41 818.88 1231.06 818.88C1163.71 818.88 1109.12 764.259 1109.12 696.88C1109.12 629.501 1163.71 574.88 1231.06 574.88C1298.41 574.88 1353 629.501 1353 696.88Z" fill="white"/> <path d="M1352.88 696.88C1352.88 764.259 1298.29 818.88 1230.94 818.88C1163.59 818.88 1109 764.259 1109 696.88C1109 629.501 1163.59 574.88 1230.94 574.88C1298.29 574.88 1352.88 629.501 1352.88 696.88Z" fill="white"/> </svg> 
</button>

{#if showGuide}
<div class="fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] flex items-center justify-center text-white">


  <div class="max-w-md p-6 rounded-lg">
    <h2 class="text-lg font-bold mb-4">hur du navigerar</h2>
    
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-medium mb-2">tangentbordskontroller</h3>
        <ul class="space-y-1 text-sm">
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">w</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">a</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">s</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">d</kbd> - förflytta dig</li>
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">space</kbd> - hoppa</li>
          <li>• 🐭 mus - se dig omkring</li>
          <li>• <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-xs">h</kbd> - visa/dölj guide</li>
        </ul>
      </div>

      {#if isMobile}
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