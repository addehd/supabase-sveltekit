<script lang="ts">
  import { name, description } from '$lib/state/art-info';
  import FormattedText from '$lib/components/FormattedText.svelte';

  // internal state for modal
  let showDescModal = false;

  $: console.log($description);

  // toggle function
  const toggleDescModal = () => {
    console.log('toggleDescModal');
    showDescModal = !showDescModal;
  }
</script>

<!-- just the modal -->
{#if showDescModal}
  <div class="fixed inset-0 flex items-center justify-center z-[60] top-0 right-0" 
    on:click={toggleDescModal}>
    <div class="absolute backdrop-blur-lg bg-black/50 max-w-[60vw] max-h-[69vh] overflow-auto text-white p-12 border-[1px] border-white/20 rounded-md" 
      on:click|stopPropagation>
      <div class="relative">
        <button 
          class="absolute top-[-2rem] right-[-2rem] p-7 text-white hover:text-gray-300" 
          on:click={toggleDescModal}>
          ✕
        </button>
        <div class="text-xl font-bold mb-6">{$name || 'Artwork'}</div>
        <FormattedText text={$description || 'No description available'} />
      </div>
    </div>
  </div>
{/if}

<!-- trigger button -->
<button class="fixed bottom-8 left-[50%] translate-x-[-50%] z-50" on:click={toggleDescModal}>
  <p class="text-white text-xl fade-in">
    {#if $name && $name !== 'Welcome'}
      <span class="text-sm italic">by</span> {$name}
    {/if}
  </p>
</button> 