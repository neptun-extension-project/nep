globalThis.browser ??= chrome;

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes("lcid")) {
      console.log(details);
      console.log("Captcha audio request intercepted:", details.url);
      browser.tabs.sendMessage(details.tabId, { audioUrl: details.url }).catch((error) => {
        console.error("Error sending message to content script:", error);
      });
    }
  },
  { urls: ["https://*/*/api/Account/CaptchaAudio?identifier=*&lcid=*"] }
);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetch") {
    fetch(message.url)
      .then(response => response.text())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error }));
    return true;
  }
});
