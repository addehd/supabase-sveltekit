<script>
  export let data;
  let exhibitions = data.exhibitions;

  function addExhibition() {
    const lastYear = exhibitions[exhibitions.length - 1].year;
    const nextYear = parseInt(lastYear) + 1;
    exhibitions = [...exhibitions, { name: '', year: nextYear.toString(), description: '' }];
  }
</script>

<div>
  <button on:click={addExhibition} class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4">
    Add Exhibition
  </button>

  {#each exhibitions as exhibition, index}
    <form method="POST" enctype="multipart/form-data" action="?/submit_exhibition" class="exhibition section border border-solid border-gray-300 rounded-md mb-8 p-7">
      <h1 class="text-3xl dark:text-white text-black font-bold mb-6">{exhibition.title}</h1>

      <label class="mb-2 dark:text-white text-black">
        Name:
        <input name="name" type="text" class="w-full px-3 py-2 border rounded" bind:value={exhibition.title} required>
      </label>
      
      <label class="mb-2 dark:text-white text-black">
        Description:
        <textarea name="description" class="w-full px-3 py-2 border rounded" bind:value={exhibition.description} required></textarea>
      </label>

      <label class="mb-2 dark:text-white text-black">
        Upload Image:
        <input name="image" type="file" accept="image/*" class="w-full px-3 py-2 border rounded" required>
      </label>

      <input type="hidden" name="year" value={exhibition.year} />

      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4">
        Submit Exhibition
      </button>
    </form>
  {/each}
</div>