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

  exhibitions = [...exhibitions, { 
    name: '', 
    year: nextYear.toString(), 
    description: '',
    default_room: 'hangaren' // or leave empty to force selection
  }];

  console.log('exhibitions', exhibitions);
}
</script>
<div class="flex justify-start shadow-xl fixed bottom-11 w-[21rem] right-11 z-11 shadow-black">
  <button on:click={addExhibition} class="bg-green-500 border border-solid border-white mx-auto w-full max-w-sm p-3 text-white px-6 py-4 rounded-md hover:bg-green-600">
    Skapa ny utställning
  </button>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 mx-4">
  {#each exhibitions as exhibition}
  
    <!-- gallery card -->
    <form method="POST" enctype="multipart/form-data" class="exhibition section border border-solid border-gray-300/30 rounded-md p-3">
      <div class="text-white">
        <h1 class="text-3xl dark:text-white text-white font-bold mb-6">{exhibition.title || 'Ny utställning'}</h1>
        
        <!-- shared input fields for both submit and edit -->
        <input type="hidden" name="exhibition_id" value={exhibition.exhibition_id} />
        
        <label class="mb-2 text-white">
          Namn:
          <input name="name" type="text" class="text-black w-full px-3 py-2 border rounded" bind:value={exhibition.title} required>
        </label>
        
        <label class="mb-4">
          Beskrivning:
          <textarea name="description" class="text-black w-full px-3 py-2 border rounded" bind:value={exhibition.description} required></textarea>
        </label>
        
        <!-- Room selection dropdown -->
        <div class="flex mb-4 items-center">
          <div class="w-1/3 text-white">Plats:</div>
          <select name="room" class="text-black w-2/3 px-3 py-1 border rounded text-sm" required>
            <option value="" disabled selected={!exhibition.default_room && !exhibition.room}>Välj</option>
            <option value="hangaren" selected={exhibition.default_room === 'hangaren' || exhibition.room === 'hangaren'}>Hangaren</option>
            <option value="stappen" selected={exhibition.default_room === 'stappen' || exhibition.room === 'stappen'}>Stappen</option>
          </select>
        </div>

        <!-- image preview -->
        <div class="w-full h-[14rem] rounded-md mb-4 bg-cover bg-center mt-3" 
          style="background-image: url('{exhibition.image_url}');" 
          aria-label={exhibition.title}>
          
          {#if !exhibition.image_url}
            <!-- SVG upload button for new posts only -->
            <button 
              type="button" 
              class="flex items-center justify-center w-full h-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              on:click={() => document.getElementById(`file-upload-${exhibition.exhibition_id || 'new'}`).click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          {/if}
        </div>
        
        <!-- hidden file input triggered by SVG button -->
        <label class="mb-2 dark:text-white text-black">
          Ladda upp bild:
          <input 
            id={`file-upload-${exhibition.exhibition_id || 'new'}`}
            name="image" 
            type="file" 
            accept="image/*" 
            class="text-black dark:text-white w-full px-3 py-2 border rounded" 
            required={!exhibition.image_url}
          >
        </label>
        
        <!-- action buttons -->
        <div class="flex flex-wrap justify-between items-center mt-4">
          <div class="flex space-x-2">
            {#if !exhibition.exhibition_id}
              <!-- new exhibition - only show submit button -->
              <button type="submit" formaction="?/submit_exhibition" class="bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600">
                Skicka
              </button>
            {:else}
              <!-- existing exhibition - show edit and delete buttons -->
              <button type="submit" formaction="?/edit_exhibition" class="bg-green-500 text-white px-4 py-2 text-sm rounded-md hover:bg-yellow-600">
                Spara 
              </button>

              
              
              <a href={`/arkiv/${exhibition.exhibition_id}`}>
                <button type="button" class="bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-green-600">
                  Redigera
                </button>
              </a>

              <button type="submit" formaction="?/delete_exhibition" class="bg-red-500 text-white px-4 py-2 text-sm rounded-md hover:bg-red-600">
                Radera
              </button>
              
              <a href={`/hangaren/${exhibition.exhibition_id}`} class="inline-block">
                <button type="button" class="bg-purple-500 text-white px-3 py-2 text-sm rounded-md hover:bg-purple-600">
                 Besök →
                </button>
              </a>
            {/if}
          </div>
        </div>
      </div>
    </form>
  {/each}
</div>