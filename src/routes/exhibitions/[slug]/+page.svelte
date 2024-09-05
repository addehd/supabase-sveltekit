<script>
  import ArtPieceForm from './_components/art_form.svelte';
  
  export let data;

  console.log(data.rooms);
  console.log(data.artworks);

  let rooms = data.rooms.map(room => {
    return {
      ...room,
      walls: {
        East: data.artworks.filter(artwork => artwork.room_id === room.id && artwork.position === 'East'),
        West: data.artworks.filter(artwork => artwork.room_id === room.id && artwork.position === 'West'),
        North: data.artworks.filter(artwork => artwork.room_id === room.id && artwork.position === 'North'),
        South: data.artworks.filter(artwork => artwork.room_id === room.id && artwork.position === 'South')
      }
    }
  });

  function addForm(roomIndex, wallPosition) {
    rooms[roomIndex].walls[wallPosition] = [
      ...rooms[roomIndex].walls[wallPosition],
      { title: '', description: '', file: null }
    ];
  }
</script>

<div class="text-white">
  {#each rooms as room, roomIndex}
    <div class="room mb-8 p-7">
      <h1 class="text-3xl dark:text-white text-black font-bold mb-6">{room.name}</h1>
      <div class="walls">

        <div class="border border-solid border-gray-300 p-7 my-7"> 
          <h3 class="text-2xl">East wall</h3>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
            on:click={() => addForm(roomIndex, 'East')}
          >
            Add art to East wall
          </button>

          <div class="form-container">
            {#each rooms[roomIndex].walls.East as form, formIndex}
              <ArtPieceForm
                roomId={room.id}
                position="East"
                form={form}
              />
            {/each}
          </div>
        </div>

        <div class="border border-solid border-gray-300 p-7 my-7">
          <h3 class="text-2xl">North wall</h3>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
            on:click={() => addForm(roomIndex, 'North')}
          >
            Add art to North wall
          </button>

          <div class="form-container">
            {#each rooms[roomIndex].walls.North as form, formIndex}
              <ArtPieceForm
                roomId={room.id}
                position="North"
                form={form}
              />
            {/each}
          </div>
        </div>

        <div class="border border-solid border-gray-300 p-7 my-7">
          <h3 class="text-2xl">South wall</h3>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
            on:click={() => addForm(roomIndex, 'South')}
          >
            Add art to South wall
          </button>

          <div class="form-container">
            {#each rooms[roomIndex].walls.South as form, formIndex}
              <ArtPieceForm
                roomId={room.id}
                position="South"
                form={form}
              />
            {/each}
          </div>
        </div>

        <div class="border border-solid border-gray-300 p-7 my-7">
          <h3 class="text-2xl">West wall</h3>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
            on:click={() => addForm(roomIndex, 'West')}
          >
            Add art to West wall
          </button>

          <div class="form-container">
            {#each rooms[roomIndex].walls.West as form, formIndex}
              <ArtPieceForm
                roomId={room.id}
                position="West"
                form={form}
              />
            {/each}
          </div>
        </div>

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