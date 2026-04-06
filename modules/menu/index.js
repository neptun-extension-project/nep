const name = "Menü";
const id = "menu";
const description = "Menü újragondolva";
const options = [];

async function loadContentScript(browser, document, window) {
  const script = document.createElement('script');
  script.id = 'menu-injector';
  script.src = browser.runtime.getURL('modules/menu/inject.js');
  script.type = 'text/javascript';
  document.documentElement.appendChild(script);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript
};