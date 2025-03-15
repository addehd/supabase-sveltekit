<script lang="ts">
  import { onMount } from 'svelte';
  import { audioSource } from '$lib/state/art-info';
  
  export let loadSmiley: () => void;
  export let removeSmiley: () => void;
  
  let audio: HTMLAudioElement;
  let isPlaying = false;

  // subscribe to audio source changes
  $: if (audio) {
    audio.src = $audioSource;
  }

  onMount(() => {
    audio = new Audio($audioSource);
    
    audio.addEventListener('ended', () => {
      isPlaying = false;
      removeSmiley();
    });

    return () => {
      audio?.pause();
      removeSmiley();
    };
  });

  function handleClick() {
    if (!isPlaying) {
      audio?.play();
      loadSmiley();
      isPlaying = true;
    } else {
      audio?.pause();
      removeSmiley();
      isPlaying = false;
    }
  }
</script>

<button 
  class="text-white font-bold text-xl h-[3rem] hover:cursor-pointer smile" 
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}>
  <svg class="h-[3rem] inline-block ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle fill="white" cx="36" cy="40.2" r="5" />
    <circle fill="white" cx="64" cy="40.2" r="5" />
    <path fill="white"
      d="M50 10c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40zm0 74.4C31 84.4 15.6 69 15.6 50S31 15.6 50 15.6 84.4 31 84.4 50 69 84.4 50 84.4z" />
    <path fill="white"
      d="M63.5 59.5c-7.4 7.4-19.6 7.4-27 0-1.1-1.1-2.9-1.1-3.9 0-1.1 1.1-1.1 2.9 0 3.9 4.8 4.8 11.1 7.2 17.5 7.2s12.6-2.4 17.5-7.2c1.1-1.1 1.1-2.9 0-3.9-1.2-1.1-3-1.1-4.1 0z" />
  </svg>
</button> 