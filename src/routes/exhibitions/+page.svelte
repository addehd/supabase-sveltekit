<script>
export let data

let exhibitions = data.exibitions

function addExhibition() {
  console.log('addExhibition');

  let nextYear;

  if (exhibitions.length > 0) {
    const lastYear = exhibitions[exhibitions.length - 1].year;
    nextYear = parseInt(lastYear) + 1;
  } else {
    const currentYear = new Date().getFullYear();
    nextYear = currentYear; 
  }

  exhibitions = [...exhibitions, { name: '', year: nextYear.toString(), description: '' }];
}
</script>

<div>
  <button on:click={addExhibition} class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4">
    Add Exhibition
  </button>

  {#each exhibitions as exhibition}
    <form method="POST" enctype="multipart/form-data" action="?/submit_exhibition" class="exhibition section border border-solid border-gray-300 rounded-md mb-8 p-7">
      <div>
        <h1 class="text-3xl dark:text-white text-black font-bold mb-6">{exhibition.title}</h1>
        <!-- <label class="mb-2 text-black">
            Name:
          <input name="name" type="text" class="w-full px-3 py-2 border rounded" bind:value={exhibition.title} required>
        </label> -->
        
        <!-- <label class="mb-2 text-black">
          Description:
          <textarea name="description" class="w-full px-3 py-2 border rounded" bind:value={exhibition.description} required></textarea>
        </label> -->
        <p>{exhibition.description}, {exhibition.img}</p>
        <img src={exhibition.image_url} alt={exhibition.title} class="w-1/2 h-1/2 rounded-md mb-4" />
        <label class="mb-2 dark:text-white text-black">
          Upload Image:
          <input name="image" type="file" accept="image/*" class="w-full px-3 py-2 border rounded" required>
        </label>
        <!-- <input type="hidden" name="year" value={exhibition.year} /> -->
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4">
          Submit Exhibition
        </button>
      </div>
      <form method="POST" action="?/delete_exhibition" class="mt-4">
        <input type="hidden" name="exhibition_id" value={exhibition.exhibition_id} />
        <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Delete Exhibition
        </button>
      </form>

      <form method="POST" action="?/edit_exhibition" class="mt-4">
        <input type="hidden" name="exhibition_id" value={exhibition.exhibition_id} />
        <label class="mb-2 text-black">
          Edit Name:
          <input name="name" type="text" class="w-full px-3 py-2 border rounded" bind:value={exhibition.title} required>
        </label>
        <label class="mb-2 text-black">
          Edit Description:
          <textarea name="description" class="w-full px-3 py-2 border rounded" bind:value={exhibition.description} required></textarea>
        </label>
        <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 mt-4">
          Save Changes
        </button>
      </form>
      <!-- button edit -->
      <a href="/exhibitions/rum">
        {exhibition.exhibition_id}
        <button type="button" on:click={() => console.log('edit')} class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 mt-4">
          Edit Exhibition
        </button>
      </a>
    </form>
  {/each}
</div>