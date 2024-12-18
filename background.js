globalThis.browser ??= chrome;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetch") {
      fetch(message.url)
        .then(response => response.text())
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error }));
      return true; // Keep the message channel open
    }
  });
