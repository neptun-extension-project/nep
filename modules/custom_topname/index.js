const name = "név személyreszabása";
const id = "custom_topname";
const description = "Személyre szabhatod a felső név megjelenését.";
const options = [
  {
    name: "Név személyre szabása",
    description: "A megadott nevet jeleníti a Neptunban tárolt helyett.",
    id: "custom_name",
    type: "text",
    value: "",
  },
  {
    name: "Megszólítás személyre szabása",
    description: "A megszólítással üdvözöl a kezdőlapon.",
    id: "custom_hello",
    type: "text",
    value: "",
  },
  {
    name: "Neptun kód személyre szabása",
    description: "A megadott Neptun kódot jeleníti meg jobb felül.",
    id: "custom_neptun",
    type: "text",
    value: "",
  },
  {
    name: "Monogram személyre szabása",
    description: "A megadott monogramot jeleníti meg a profilon.",
    id: "custom_monogram",
    type: "text",
    value: "",
  },
];

function getOption(option) {
  return options.find((item) => item.id == option).value;
}

// Parts of this function were written by Cluade 3.5 Sonnet
function loadContentScript(browser, document) {
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

  // Initial set
  setCustomTextAll();

  // Set up MutationObserver to watch for changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        setCustomTextAll();
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
  setInterval(setCustomTextAll, 1000); // Check every 1000ms (1 second)

  // Also set the text when the page gains focus
  window.addEventListener('focus', setCustomTextAll);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript
};