<script>
  export let data;

  let rum = data.rum;

  console.log(rum);

  let rooms = [
    {
      name: 'Hangaren',
      walls: [
        { title: 'East', forms: [] },
        { title: 'West', forms: [] },
        { title: 'South', forms: [] },
        { title: 'North', forms: [] }
      ]
    },
    {
      name: 'Stäppen',
      walls: [
        { title: 'East', forms: [] },
        { title: 'West', forms: [] },
        { title: 'South', forms: [] },
        { title: 'North', forms: [] }
      ]
    }
  ];

  function addForm(roomIndex, wallIndex) {
    rooms[roomIndex].walls[wallIndex].forms = [...rooms[roomIndex].walls[wallIndex].forms, { title: '', description: '', file: null }];
  }

  function updateForm(roomIndex, wallIndex, formIndex, key, value) {
    rooms[roomIndex].walls[wallIndex].forms[formIndex][key] = value;
  }
</script>

<div>
  {#each rooms as room, roomIndex}
    <div class="room section border border-solid border-gray-300 rounded-md mb-8 p-7">
      <h1 class="text-3xl dark:text-white text-black font-bold mb-6">{room.name}</h1>
      <div class="walls">
        {#each room.walls as wall, wallIndex}
          <div class="wall section border border-solid border-gray-300 rounded-md mb-6 p-7">
            <h2 class="text-2xl dark:text-white text-black font-bold mb-4">{wall.title} Wall</h2>
            <button on:click={() => addForm(roomIndex, wallIndex)} class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4">
              Add Artwork to {wall.title} Wall
            </button>
            <div class="flex flex-row overflow-x-scroll">
              {#each wall.forms as form, formIndex}
                <div class="form-container mb-4 mr-2" key={formIndex}>
                  <div class="flex flex-col w-full">

                    <div class="flex items-center justify-center w-full mb-4">
                      <label for={"dropzone-file-" + roomIndex + "-" + wallIndex + "-" + formIndex} class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input id={"dropzone-file-" + roomIndex + "-" + wallIndex + "-" + formIndex} type="file" class="hidden" on:change={(e) => updateForm(roomIndex, wallIndex, formIndex, 'file', e.target.files[0])} />
                      </label>
                    </div>
                    
                    <label class="mb-2 dark:text-white text-black">
                      Title:
                      <input type="text" class="w-full px-3 py-2 border rounded" value={form.title} on:input={(e) => updateForm(roomIndex, wallIndex, formIndex, 'title', e.target.value)} />
                    </label>
                    <label class="mb-2">
                      Description:
                      <textarea class="w-full px-3 py-2 border rounded" value={form.description} on:input={(e) => updateForm(roomIndex, wallIndex, formIndex, 'description', e.target.value)}></textarea>
                    </label>
                  
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>