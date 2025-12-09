document.addEventListener("DOMContentLoaded", () => {
  const quoteText = document.getElementById("quote-text");
  

  async function loadQuote() {
    quoteText.textContent = "Loading quote...";
    try {
  const response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://zenquotes.io/api/random"));
const dataWrapper = await response.json();
const data = JSON.parse(dataWrapper.contents); 
const quote = data[0];
quoteText.textContent = `"${quote.q}" — ${quote.a}`;
    } catch (error) {
      console.error("Quote API error:", error);
      quoteText.textContent = `"Keep pushing forward, no matter what." — Unknown`;
    }
  }

 
  loadQuote();
});
