const name = "süti elfogadása";
const id = "cookie_accepter";
const description = "Automatikusan elfogadja a sütiket. Mert ki ne fogadna el egy kis sütit?";
const options = [];

// Parts of this function were written by Cluade 3.5 Sonnet
function loadContentScript(browser, document) {
  localStorage.setItem('cookieAccepted', 'true');
  async function tryAcceptCookies() {
    const notificationBar = document.querySelector(".notification-bar__title");
    if (notificationBar && notificationBar.textContent.includes('sütiket használ')) {
      document.querySelector(".notification-button__container button").click()
    }
  }

  // Initial set
  tryAcceptCookies();

  // Set up MutationObserver to watch for changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        tryAcceptCookies();
      }
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Periodically check and set the text
  setInterval(tryAcceptCookies, 1000); // Check every 1000ms (1 second)

  // Also set the text when the page gains focus
  window.addEventListener('focus', tryAcceptCookies);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript,
};