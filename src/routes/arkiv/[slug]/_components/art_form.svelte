<!-- ArtPieceForm.svelte -->
<script>
  export let roomId;
  export let wall;
  export let form;
  export let artists;
  export let room;
  export let order;
  export let exhibition_id;
  export let audio_url = 'https://sdsirlozivhqmtcexwbu.supabase.co/storage/v1/object/public/bucket/audio/Safe_2024-12-20.mp3';

 // console.log('exhibition_id:', exhibition_id, wall);
</script>

<form method="POST" enctype="multipart/form-data" action="?/submit_artwork" class="mb-4 mr-4 float-left overflow-hidden">
  <input type="hidden" name="room_id" value={roomId} />
  <input type="hidden" name="wall" value={wall} />
  <input type="hidden" name="order" value={order} />
  <input type="hidden" name="artist_id" value={form.artist_id} />
  <input type="hidden" name="room" value={room} />
  <input type="hidden" name="artwork_id" value={form.artwork_id} />
  <input type="hidden" name="exhibition_id" value={exhibition_id} />

  <div class="mb-4">
    <label for="title" class="block text-black dark:text-white mb-2">Art Piece Title</label>
    <input
      id="title"
      name="title"
      type="text"
      class="w-full px-3 py-2 border rounded text-black"
      bind:value={form.title}
      required
    />
  </div>

  <div class="mb-4">
    <label for="short_description" class="block text-black dark:text-white mb-2">Short Description</label>
    <input
      id="short_description"
      name="short_description"
      type="text"
      class="w-full px-3 py-2 border rounded text-black"
      bind:value={form.short_description}
    />
  </div>
  
  <div class="mb-4">
    <label for="description" class="block text-black dark:text-white mb-2">Description</label>
    <textarea
      id="description"
      name="description"
      class="w-full px-3 py-2 border rounded text-black"
      bind:value={form.description}
      required
    ></textarea>
  </div>
  
  <div class="mb-4">
    <label for="image" class="block text-black dark:text-white mb-2">Upload Image</label>
    <input
      id="image"
      name="image"
      type="file"
      accept="image/*"
      class="w-full px-3 py-2 border rounded"
    />
  </div>

  {#if audio_url}
    <div class="mb-4 pointer hover:cursor-pointer">
      <a href={audio_url} target="_blank" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4">
        Listen to audio
      </a>
    </div>
  {/if}
  
  <label for="artist_select" class="sr-only">Select Artist</label>
  <select id="artist_select" class="bg-gray-700 text-white rounded-md p-2 mb-4 w-72" bind:value={form.artist_id}>
    {#each artists as artist}
      <option value={artist.artist_id}>{artist.name}</option>
    {/each}
  </select>
  
  <button
    type="submit"
    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
  >
    Submit Art Piece
  </button>

  <button
    type="submit"
    formaction="?/update_artwork"
    class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 mt-4 ml-2"
  >
    Update Art Piece
  </button>
</form>
