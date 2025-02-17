  <script lang="ts">
    export let data;

    let csvFile: File | null = null;
    let exhibitionNumber: number = 0;
    let wallName: string = '';
    let room: string = '';

    $: artists = data.artists;

    const handleCsvChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        csvFile = input.files[0];
      }
    };

    const handleUpload = async () => {
      if (csvFile) {
        const formData = new FormData();
        formData.append('exhibitionNumber', exhibitionNumber.toString());
        formData.append('wallName', wallName);
        formData.append('room', room);
        formData.append('csv', csvFile);
        
        try {
          const response = await fetch('?/upload', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            alert('CSV uploaded successfully!');
          }
        } catch (error) {
          alert('Upload failed');
        }
      } else {
        alert("No CSV file selected for upload.");
      }
    };
  </script>

  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4 w-72 my-24 mx-auto flex-1">
    <h1 class="text-2xl font-bold mb-6">CSV Upload</h1>
    <p class="text-sm text-gray-400 mb-6">Upload a CSV file with artwork information</p>

    <div class="w-full max-w-md space-y-4">
      <div class="text-sm text-gray-400 mb-1">Exhibition number:</div>
      <input
        type="number"
        bind:value={exhibitionNumber}
        class="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
        placeholder="Enter order number"/>
      
      <select
        bind:value={wallName}
        class="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700">
        <option value="">Select wall</option>
        <option value="north">North</option>
        <option value="east">East</option>
        <option value="south">South</option>
        <option value="west">West</option>
      </select>
      
      <select
        bind:value={room}
        class="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700">
        <option value="">Select room</option>
        <option value="stappen">Stappen</option>
        <option value="hangaren">Hangaren</option>
      </select>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
          on:change={handleCsvChange} />
      </div>

      <button
        on:click={handleUpload}
        class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition">
        Upload
      </button>
    </div>
  </div>
