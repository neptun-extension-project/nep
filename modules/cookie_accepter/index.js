const name = "Süti elfogadása";
const id = "cookie_accepter";
const description = "Automatikusan elfogadja a sütiket. Mert ki ne fogadna el egy kis sütit?";
const options = [];

async function loadContentScript(browser, document) {
  localStorage.setItem('cookieAccepted', 'true');
  const utils = await import(browser.runtime.getURL('../utils.js'));

  async function tryAcceptCookies() {
    const notificationBar = document.querySelector(".notification-bar__title");
    if (notificationBar && notificationBar.textContent.includes('sütiket használ')) {
      document.querySelector(".notification-button__container button").click()
    }
  }

  utils.tryToRun(tryAcceptCookies);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript,
};