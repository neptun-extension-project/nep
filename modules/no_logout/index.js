const name = "kidobás elleni védelem";
const id = "no_logout";
const description = "10 percenként frissíti az aktivitást, így megakadályzova az automata kijelentkeztetést.";
const options = [];

function loadContentScript(browser, document) {
    let s = document.createElement('script');
    s.src = browser.runtime.getURL("modules/no_logout/inject.js");
    (document.head || document.documentElement).appendChild(s);
    s.onload = function() {
      s.remove();
    };
}

export { name, id, description, options, loadContentScript };
