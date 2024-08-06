<script>
  let exhibitions = [
    {
      name: '',
      year: '2019',
      description: ''
    }
  ];

  function addExhibition() {
    const lastYear = exhibitions[exhibitions.length - 1].year;
    const nextYear = parseInt(lastYear) + 1;
    exhibitions = [...exhibitions, { name: '', year: nextYear.toString(), description: '' }];
  }

  function updateExhibition(index, key, value) {
    exhibitions[index][key] = value;
  }
</script>

<div>
  <button on:click={addExhibition} class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4">
    Add Exhibition
  </button>
  {#each exhibitions as exhibition, index}
    <div class="exhibition section border border-solid border-gray-300 rounded-md mb-8 p-7">
      <h1 class="text-3xl dark:text-white text-black font-bold mb-6">{exhibition.year}</h1>
      <label class="mb-2 dark:text-white text-black">
        Name:
        <input type="text" class="w-full px-3 py-2 border rounded" value={exhibition.name} on:input={(e) => updateExhibition(index, 'name', e.target.value)} />
      </label>
      <label class="mb-2 dark:text-white text-black">
        Description:
        <textarea class="w-full px-3 py-2 border rounded" value={exhibition.description} on:input={(e) => updateExhibition(index, 'description', e.target.value)}></textarea>
      </label>
    </div>
  {/each}
</div>