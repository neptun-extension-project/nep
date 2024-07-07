globalThis.browser ??= chrome;

(async () => {
  const modules = await import(browser.runtime.getURL("./modules.js"));

  try {
    const moduleList = await modules.getModules();

    moduleList.forEach((module) => {
      if (module && typeof module.loadContentScript === "function") {
        module.loadContentScript(browser, document);
        console.log("Loaded content script:", module.name);
      }
    });
  } catch (error) {
    console.error("error loading content scripts:", error);
  }
})();
