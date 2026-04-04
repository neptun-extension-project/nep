const name = "Név személyreszabása";
const id = "custom_name";
const description = "Személyre szabhatod a felső név megjelenését.";
const options = [
  {
    name: "név",
    description: "A megadott nevet jeleníti a Neptunban tárolt helyett.",
    id: "custom_name",
    type: "text",
    value: "",
  },
  {
    name: "megszólítás",
    description: "A megszólítással üdvözöl a kezdőlapon.",
    id: "custom_hello",
    type: "text",
    value: "",
  },
  {
    name: "neptun kód",
    description: "A megadott Neptun kódot jeleníti meg jobb felül.",
    id: "custom_neptun",
    type: "text",
    value: "",
  },
  {
    name: "monogram",
    description: "A megadott monogramot jeleníti meg a profilon.",
    id: "custom_monogram",
    type: "text",
    value: "",
  },
];

function getOption(option) {
  return options.find((item) => item.id == option).value;
}

async function loadContentScript(browser, document, window) {
  const utils = await import(browser.runtime.getURL('../utils.js'));

  function setCustomTextAll() {
    // TODO: support other languages
    const hello = getOption("custom_hello") ? getOption("custom_hello") : 'Tisztelt';

    // TODO: allow changing hello message without a custom_name
    if (getOption("custom_name")) {
      setCustomTextFor('.header__title', hello + ' ' + getOption("custom_name") + '!');
      setCustomTextFor('.user-menu__name', getOption("custom_name"));
      setCustomTextFor('.personal-header__title h1', getOption("custom_name"));
    }

    if (getOption("custom_neptun")) {
      setCustomTextFor('.user-menu__code', '(' + getOption("custom_neptun") + ')');
    }

    if (getOption("custom_monogram")) {
      setCustomTextFor('.monogram-name', getOption("custom_monogram"));
    }
  }

  function setCustomTextFor(targetClass, desiredText) {
    const headerElements = document.querySelectorAll(targetClass);
    for (const headerElement of headerElements) {
      if (headerElement && headerElement.textContent !== desiredText) {
        headerElement.textContent = desiredText;
        console.log('Header text set to: ' + desiredText);
      }
    }
  }

  utils.tryToRun(setCustomTextAll);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript
};