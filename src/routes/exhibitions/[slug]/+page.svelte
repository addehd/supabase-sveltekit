<script>
  import ArtPieceForm from './_components/art_form.svelte';
  
  export let data;

  console.log(data.artworks);

  let sections = {
    Hangaren: {
      East: data.artworks.filter(artwork => artwork.wall === 'east'),
      West: data.artworks.filter(artwork => artwork.wall === 'west'),
      North: data.artworks.filter(artwork => artwork.wall === 'north'),
      South: data.artworks.filter(artwork => artwork.wall === 'south'),
    },
    Stappen: {
      'Stappen West': data.artworks.filter(artwork => artwork.wall === 'stappen west'),
      'Stappen South': data.artworks.filter(artwork => artwork.wall === 'stappen south')
    }
  };

  function addForm(section, wallPosition) {
    sections[section][wallPosition] = [
      ...sections[section][wallPosition],
      { title: '', description: '', image_url: '', wall: wallPosition.toLowerCase() }
    ];
  }
</script>

<div class="text-white">
  {#each Object.entries(sections) as [sectionName, walls]}
    <h2 class="text-3xl mb-4">{sectionName} 1</h2>
    {#each Object.entries(walls) as [wallPosition, artworks]}
      <div class="border border-solid border-gray-300 p-7 my-7">
        <h3 class="text-2xl">{wallPosition} wall</h3>
        <button
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
          on:click={() => addForm(sectionName, wallPosition)}
        >
          Add art to {wallPosition} wall
        </button>

        <div class="form-container">
          <div class="artwork-scroll">
            {#each artworks as form, formIndex}
              <div class="artwork rounded-sm flex justify-between px-7 py-7 bg-gray-300/15 w-[60rem] relative">
                <div class="artwork-number">{formIndex + 1}</div>
                <div class="flex flex-col">
                  {wallPosition}
                  <ArtPieceForm
                    roomId={form.room}
                    position={wallPosition}
                    form={form}
                    artists={data.artists}
                    room={sectionName} />
                </div>

                <div class="artwork-image w-[50%]" style="background-image: url('{form.image_url}')"></div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  {/each}
</div>

<style>
  .form-container {
    width: 100%;
    overflow-x: auto;
  }

  .artwork-scroll {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 20px;
  }

  .artwork {
    flex: 0 0 auto;
    margin-right: 20px;
  }

  .artwork-image {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .artwork-number {
    position: absolute;
    top: 4px;
    right: 4px;
    padding-left: 2px;
    background-color: rgba(255, 255, 255, 0.8);
    color: black;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.7rem;
  }
</style>