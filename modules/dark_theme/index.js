const name = "dark theme";
const id = "dark_theme";
const description = "Sötétebbé teszi a Neptun felületét.";
const options = [];

function loadContentScript(browser, document) {
  const head = document.head || document.getElementsByTagName("head")[0];

  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = browser.runtime.getURL("modules/dark_theme/index.css");
  head.append(style);
}

export { name, id, description, options, loadContentScript };
