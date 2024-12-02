<script>
  import ArtPieceForm from './_components/art_form.svelte';
  import { flip } from 'svelte/animate';
  
  export let data;

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

  async function handleReorder(event, sectionName, wallPosition) {
    const { oldIndex, newIndex } = event.detail;
    const items = sections[sectionName][wallPosition];
    
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    
    const updates = items.map((item, index) => ({
      artwork_id: item.artwork_id,
      order: index + 1
    }));

    console.log('updates:', updates);
    const response = await fetch(`?/update_order`, {
      method: 'POST',
      body: JSON.stringify({ updates })
    });
  }

</script>

<div class="text-white">
  <h1 class="w-full text-center text-5xl pt-14 p-7">Utställning nr {data.exhibition_id}</h1>
  {#each Object.entries(sections) as [sectionName, walls]}
    <h2 class="text-3xl mb-4">{sectionName} 1</h2>
    {#each Object.entries(walls) as [wallPosition, artworks]}
      <div class="border border-solid border-gray-300 p-7 my-7">
        <h3 class="text-2xl">{wallPosition} wall</h3>
        
        <div class="form-container">
          {wallPosition}
          <div class="artwork-scroll">
            {#each artworks as form, formIndex (form.artwork_id)}
            <div class="artwork rounded-sm flex justify-between px-7 py-7 bg-gray-300/15 w-[60rem] relative"
                 draggable="true"
                 on:dragstart={(e) => {
                   e.dataTransfer.setData('text/plain', formIndex.toString());
                 }}
                 on:dragover|preventDefault
                 on:drop|preventDefault={(e) => {
                   const oldIndex = parseInt(e.dataTransfer.getData('text/plain'));
                   handleReorder({ detail: { oldIndex, newIndex: formIndex }}, sectionName, wallPosition);
                 }}
                 animate:flip={{ duration: 300 }}>
              <div class="artwork-number">{formIndex + 1}</div>
              <div class="flex flex-col">
                {wallPosition}
                <ArtPieceForm
                  exhibition_id={data.exhibition_id}
                  roomId={form.room}
                  wall={wallPosition}
                  form={form}
                  artists={data.artists}
                  order={formIndex + 1}
                  room={sectionName} />
              </div>
              
              <div class="artwork-image w-[50%]" style="background-image: url('{form.image_url}')"></div>
            </div>
            {/each}
          </div>
        </div>
        <button class="bg-green-500 mt-5 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
          on:click={() => addForm(sectionName, wallPosition)} >
          Add art to {wallPosition} wall
        </button>
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
    cursor: move;
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

  .artwork.dragging {
    opacity: 0.5;
  }
</style>