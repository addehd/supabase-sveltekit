<!-- ArtPieceForm.svelte -->
<script>
  export let roomId;
  export let position;
  export let form;
</script>

<form method="POST" enctype="multipart/form-data" action="?/submit_exhibition" class="mb-4 mr-4 float-left overflow-hidden">
  <input type="hidden" name="room_id" value={roomId} />
  <input type="hidden" name="position" value={position} />
  
  <div class="mb-4">
    <label class="block text-black dark:text-white mb-2">Art Piece Title</label>
    <input
      name="title"
      type="text"
      class="w-full px-3 py-2 border rounded text-black"
      bind:value={form.title}
      required
    />
  </div>
  
  <div class="mb-4">
    <label class="block text-black dark:text-white mb-2">Description</label>
    <textarea
      name="description"
      class="w-full px-3 py-2 border rounded text-black"
      bind:value={form.description}
      required
    ></textarea>
  </div>
  
  <div class="mb-4">
    <label class="block text-black dark:text-white mb-2">Upload Image</label>
    <input
      name="image"
      type="file"
      accept="image/*"
      class="w-full px-3 py-2 border rounded"
      required
    />
  </div>
  
  <button
    type="submit"
    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
  >
    Submit Art Piece
  </button>
</form>