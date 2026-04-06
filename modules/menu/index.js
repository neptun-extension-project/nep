const name = "Menü";
const id = "menu";
const description = "Menü újragondolva";
const options = [
  {
    name: "kedvencek elrejtése",
    description: "Elrejti a kedvencek menüpontot a menüsávban.",
    id: "hide_favorites",
    type: "checkbox",
    value: false,
  },
];

function getOption(option) {
  return options.find((item) => item.id == option).value;
}

async function loadContentScript(browser, document, window) {
  const meta = document.createElement('meta');
  meta.name = "hide_favorites";
  meta.content = getOption("hide_favorites");
  document.head.appendChild(meta);
  
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