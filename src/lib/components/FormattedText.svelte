<script>
  export let text = "";

  // function to split text into logical paragraphs
  function formatText(text) {
    if (!text) return [];

    return text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .reduce((acc, sentence, index) => {
        if (index % 3 === 0) acc.push([]);
        acc[acc.length - 1].push(sentence);
        return acc;
      }, [])
      .map(group => group.join(" "));
  }

  // processed paragraphs
  $: paragraphs = formatText(text);
</script>

<div>
  {#each paragraphs as paragraph, index}
    <p class="mb-4 leading-relaxed">{paragraph}</p>
  {/each}
</div> 