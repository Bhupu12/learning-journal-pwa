document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copy-entry");
  const input = document.getElementById("journal-input");

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      alert("Journal text copied to clipboard!");
    } catch (err) {
      alert("Clipboard copy failed.");
    }
  });
});
