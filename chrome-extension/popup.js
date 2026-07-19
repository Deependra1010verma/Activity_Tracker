document.getElementById('clipBtn').addEventListener('click', async () => {
  // Get active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;

  // Execute script to get highlighted text
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  const selectedText = result[0]?.result || "";
  const pageTitle = tab.title || "Web Clipped Note";

  // Build the URL with query parameters
  const baseUrl = "https://khushbu-verma.vercel.app/learn"; // Change to production URL if deployed
  
  const searchParams = new URLSearchParams();
  searchParams.set("topic", pageTitle);
  if (selectedText) {
    searchParams.set("notes", selectedText);
  }

  const finalUrl = `${baseUrl}?${searchParams.toString()}`;

  // Open the web app in a new tab
  chrome.tabs.create({ url: finalUrl });
});
