const name = "2fa átugrása";
const id = "bypass_2fa";
const description = "todo";
const options = [];

function loadContentScript(browser, document) {}

function enable() {
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ruleset_bypass_2fa"]
  });
}

function disable() {
  chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: ["ruleset_bypass_2fa"]
  });
}

export {
  name,
  id,
  description,
  options,
  loadContentScript,
  enable,
  disable,
};