const name = "dark theme";
const id = "dark_theme";
const options = [];

function loadContentScript(browser, document) {
  const head = document.head || document.getElementsByTagName("head")[0];

  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = browser.runtime.getURL("modules/dark_theme/index.css");
  head.append(style);

  var meta = document.createElement("meta");
  meta.name = "color-scheme";
  meta.content = "dark light";
  head.append(meta);
}

export { name, id, options, loadContentScript };
