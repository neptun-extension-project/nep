const name = "név személyreszabása";
const id = "custom_topname";
const description = "Személyre szabhatod a felső név megjelenését.";
const options = [
  {
    name: "Cenzúra",
    description: "Kitakarja a nevedet egy csíkkal, ha nincs rajta a kurzor.",
    id: "censor",
    type: "checkbox",
    value: false,
  },
];

function loadContentScript(browser, document) {
  if (options.find((item) => item.id == "censor").value) {
    const head = document.head || document.getElementsByTagName("head")[0];

    var style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = browser.runtime.getURL("modules/custom_topname/index.css");
    head.append(style);
  }

  const topname = document.getElementById("upTraining_topname");
  const topnameString = topname.innerText.trim();
  let name = topnameString.split(" - ")[0];
  let neptun = topnameString.split(" - ")[1];

  topname.innerText = name + " - " + neptun;
}

export { name, id, description, options, loadContentScript };
