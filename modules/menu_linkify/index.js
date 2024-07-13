const name = "menü linkesítő";
const id = "menu_linkify";
const description = "A menü gombokat lecseréli linkekre.";
const options = [];

// This was ported (stolen) from NPU: https://github.com/solymosi/npu/blob/master/src/modules/mainMenuFixes.js
// TODO: shortcuts

function loadContentScript(browser, document) {
  const menu_items = document.getElementsByClassName("menu-item");
  for (const item of menu_items) {
    var a = document.createElement("a");
    a.setAttribute("href", item.getAttribute("targeturl"));
    a.style =
      "display: block; position: absolute; left: 0; top: 0; width: 100%; height: 100%";
    item.style = "position: relative;";
    item.append(a);
  }
}

export { name, id, description, options, loadContentScript };
