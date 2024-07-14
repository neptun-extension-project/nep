const name = "reklám kiszedése";
const id = "ad_block";
const description = "Reklám kiszedése a login oldalról";
const options = [];

function loadContentScript(browser, document) {
  const diakhitelAd = document.getElementById("labelDiakhitel");
  if (diakhitelAd) diakhitelAd.innerHTML = "";
}

export { name, id, description, options, loadContentScript };
