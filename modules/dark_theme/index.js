const name = "dark theme";
const id = "dark_theme";
const description = "Sötétebbé teszi a Neptun felületét.";
const options = [];

const headerImages = [
  { className: "main_header_r", image: "header_right.png" },
  { className: "main_header_m", image: "header_mid.png" },
  { className: "main_header_l", image: "header_left.png" },
];

function loadContentScript(browser, document) {
  const head = document.head || document.getElementsByTagName("head")[0];

  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = browser.runtime.getURL("modules/dark_theme/index.css");
  head.append(style);

  // replace jpeg images with png-s

  headerImages.forEach(({ className, image }) =>
    setBackgroundImage(className, "modules/dark_theme/" + image)
  );

  setElementSource("upBoxes_upBoxesButtons_btnRss", "actuel_icon.png");
  setElementSource("upBoxes_upBoxesButtons_btnMessage", "message_icon.png");
  setElementSource("upBoxes_upBoxesButtons_btnFavorite", "favorit_icon.png");
  setElementSource("upBoxes_upBoxesButtons_btnCalendar", "calendar_icon.png");

  setElementSource("c_messages_gridMessages_imexcel", "excel.png");
  setElementSource("c_messages_gridMessages_imgprint", "print.png");
  setElementSource("c_messages_gridMessages_imgpin", "pin.png");
  setElementSource("imgsearch", "search.png");
}

function setBackgroundImage(className, imagePath) {
  const elements = document.getElementsByClassName(className);
  const imageUrl = `url('${browser.runtime.getURL(imagePath)}')`;

  for (const element of elements) {
    element.style.backgroundImage = imageUrl;
  }
}

function setElementSource(elementId, imagePath) {
  const element = document.getElementById(elementId);
  if (element) {
    if ("src" in element) {
      element.src = browser.runtime.getURL("modules/dark_theme/" + imagePath);
    } else {
      console.warn(
        `Element with ID '${elementId}' does not have a 'src' attribute`
      );
    }
  } else {
    console.warn(`Element with ID '${elementId}' not found`);
  }
}

export { name, id, description, options, loadContentScript };
