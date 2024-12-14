<script lang="ts">
  let selectedFiles: File[] = []; // Array to hold selected files

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      selectedFiles = Array.from(input.files); // Convert FileList to Array
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      try {
        const response = await fetch('?/upload', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          alert('Files uploaded successfully!');
        }
      } catch (error) {
        alert('Upload failed');
      }
    } else {
      alert("No files selected for upload.");
    }
  };
</script>

<div class="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
  <h1 class="text-2xl font-bold mb-6">Batch Upload</h1>

  <div class="w-full max-w-md space-y-4">
    <!-- File input -->
    <input
      type="file"
      multiple
      class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
      on:change={handleFileChange}
    />

    <!-- Display selected file names -->
    {#if selectedFiles.length > 0}
      <ul class="bg-gray-800 rounded-lg p-4">
        {#each selectedFiles as file}
          <li class="text-sm text-gray-300">📄 {file.name}</li>
        {/each}
      </ul>
    {/if}

    <!-- Upload button -->
    <button
      on:click={handleUpload}
      class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition"
    >
      Upload
    </button>
  </div>
</div>