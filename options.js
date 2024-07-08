globalThis.browser ??= chrome;

async function saveOptions(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll("ul#module-list > li > input");
  let moduleOptions = {};
  inputs.forEach(async (input) => {
    console.log(input.id, input.checked);
    if (input.checked) {
      moduleOptions[input.id] = true;
    }
  });
  console.log("set:", moduleOptions);
  await browser.storage.sync.set({ moduleOptions: moduleOptions });
}

async function restoreOptions() {
  const modules = await import(browser.runtime.getURL("./modules.js"));

  try {
    const moduleList = await modules.getModules();
    console.log("modules:", moduleList);

    const moduleOptions =
      (await browser.storage.sync.get("moduleOptions")).moduleOptions || {};
    console.log("got:", moduleOptions);

    moduleList.forEach((module) => {
      if (module) {
        const li = document.createElement("li");

        const label = document.createElement("label");
        label.setAttribute("for", module.id);
        label.innerText = module.name;
        li.append(label);

        const input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.id = module.id;
        if (moduleOptions[module.id]) input.setAttribute("checked", true);
        li.append(input);

        const ul = document.getElementById("module-list");
        ul.append(li);
        console.log("Loaded settings for:", module.name);
      }
    });
  } catch (error) {
    console.error("error loading content scripts:", error);
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
