const name = "Kidobás elleni védelem";
const id = "anti_logout";
const description = "Inaktivitás ellenére is bejelentkezve tart.";
const options = [];

function loadContentScript(browser, document) {
  const clickEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
  function fireEvent() {
    console.log('Firing event');
    document.querySelector('.footer__version').dispatchEvent(clickEvent);
  }
  setInterval(fireEvent, 4*60*1000);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript
};