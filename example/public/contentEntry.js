(async () => {
  const url = chrome.runtime.getURL("index.js");
  await import(url);
})();
