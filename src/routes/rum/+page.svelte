<script>
  let walls = [
    { title: 'East', forms: [] },
    { title: 'West', forms: [] },
    { title: 'South', forms: [] },
    { title: 'North', forms: [] }
  ];

  function addForm(wallIndex) {
    walls[wallIndex].forms = [...walls[wallIndex].forms, {}];
  }
</script>


<div class="wall section border border-solid border-gray-300 rounded-md"> 
  {#each walls as wall, wallIndex}
    <div class="wall section border border-solid border-gray-300 rounded-md mb-6">
      <h2 class="text-2xl font-bold mb-4">{wall.title} Wall</h2>
      <button on:click={() => addForm(wallIndex)} class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4">
        Add Artwork to {wall.title} Wall
      </button>
      <div class="flex flex-row overflow-x-scroll"> 
        {#each wall.forms as form, formIndex}
          <div class="form-container mb-4" key={formIndex}>
            <div class="flex items-center justify-center w-full">
              <label for={"dropzone-file-" + wallIndex + "-" + formIndex} class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input id={"dropzone-file-" + wallIndex + "-" + formIndex} type="file" class="hidden" />
              </label>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>