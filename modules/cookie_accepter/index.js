const name = "süti elfogadása";
const id = "cookie_accepter";
const description = "Automatikusan elfogadja a sütiket. Mert ki ne fogadna el egy kis sütit?";
const options = [];

function loadContentScript(browser, document) {
  localStorage.setItem('cookieAccepted', 'true');
}

export {
  name,
  id,
  description,
  options,
  loadContentScript,
};