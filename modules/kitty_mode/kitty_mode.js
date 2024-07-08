const name = "kitty mode";
const id = "kitty_mode";
const options = [
  {
    name: "Minden cica",
    description: "Mindig mutasson minden cicát.",
    id: "all_cats",
    type: "checkbox",
    default: false,
  },
];

function loadContentScript(browser, document) {
  const head = document.head || document.getElementsByTagName("head")[0];

  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = browser.runtime.getURL("modules/kitty_mode/kitty_style.css");
  head.append(style);

  const catGifs = [
    "FERRIS.gif",
    "FIREFOX.gif",
    "GHOSTPUFFS.gif",
    "KACE.gif",
    "KINAKO.gif",
    "MANEKI.gif",
    "MIDNIGHT.gif",
    "PUMPKINSPICELATTE.gif",
    "SPRINKLES.gif",
    "STRIPES.gif",
    "VALENTIN.gif",
    "xX_vampiregoth91_Xx.gif",
  ];

  const addKitty = () => {
    const panHeader = document.getElementById("panHeader");
    if (!panHeader) return;

    const img = document.createElement("img");
    const randomCat = catGifs[Math.floor(Math.random() * catGifs.length)];
    img.src = browser.runtime.getURL("modules/kitty_mode/cats/" + randomCat);
    img.className = "kitty";

    const fromLeft = Math.random() < 0.5;
    if (fromLeft) {
      img.style.left = "-10%";
      img.style.animationName = "kitty-walk-left";
      img.classList.add("left");
    } else {
      img.style.right = "-10%";
      img.style.animationName = "kitty-walk-right";
    }

    panHeader.appendChild(img);

    setTimeout(() => {
      document.body.removeChild(img);
    }, 20000);
  };

  setInterval(() => {
    if (Math.random() < 0.1) {
      addKitty();
    }
  }, 1000);
}

export { loadContentScript, name, id, options };
