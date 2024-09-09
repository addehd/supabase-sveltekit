<script>
  import ArtPieceForm from './_components/art_form.svelte';
  
  export let data;

  let artworksByWall = {
    East: data.artworks.filter(artwork => artwork.wall === 'east'),
    West: data.artworks.filter(artwork => artwork.wall === 'west'),
    North: data.artworks.filter(artwork => artwork.wall === 'north'),
    South: data.artworks.filter(artwork => artwork.wall === 'south')
  };

  function addForm(wallPosition) {
    artworksByWall[wallPosition] = [
      ...artworksByWall[wallPosition],
      { title: '', description: '', file: null, wall: wallPosition }
    ];
  }
</script>

<div class="text-white">
  {#each Object.keys(artworksByWall) as wallPosition}
    <div class="border border-solid border-gray-300 p-7 my-7">
      <h3 class="text-2xl">{wallPosition} wall</h3>
      <button
        class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
        on:click={() => addForm(wallPosition)}
      >
        Add art to {wallPosition} wall
      </button>

      <div class="form-container">
        {#each artworksByWall[wallPosition] as form, formIndex}
          <ArtPieceForm
            roomId={form.room}
            position={wallPosition}
            form={form}
          />
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .form-container {
    overflow: hidden;
    width: 100%;
  }
  form {
    float: right;
    margin-right: 10px;
    width: 100%; /* Adjust width as needed */
  }
</style>