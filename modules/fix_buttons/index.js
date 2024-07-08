const name = "fix button labels";
const id = "fix_buttons";
const description = "Megjavítja a gombok feliratát.";
const options = [];

function loadContentScript(browser, document) {
  function fixButtons() {
    const buttons = document.getElementsByClassName("ui-button-text-only");
    Array.from(buttons).forEach((button) => {
      button.value = button.getAttribute("commandname");
    });
  }

  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === "childList") {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            fixButtons();
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export { name, id, description, options, loadContentScript };
