globalThis.browser ??= chrome;

async function saveOptions(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll("ul#module-list > li > input");
  const moduleOptions = Object.fromEntries(
    Array.from(inputs)
      .filter((input) => input.checked)
      .map((input) => [input.id, true])
  );
  console.log("set:", moduleOptions);
  await browser.storage.sync.set({ moduleOptions });
}

async function restoreOptions() {
  try {
    const modules = await import(browser.runtime.getURL("./modules.js"));
    const moduleList = await modules.getModules();
    console.log("modules:", moduleList);

    const { moduleOptions = {} } = await browser.storage.sync.get(
      "moduleOptions"
    );
    console.log("got:", moduleOptions);

    const ul = document.getElementById("module-list");
    moduleList.forEach((module) => {
      if (module) {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const input = document.createElement("input");

        label.setAttribute("for", module.id);
        label.textContent = module.name;

        input.type = "checkbox";
        input.id = module.id;
        input.checked = !!moduleOptions[module.id];

        li.append(label, input);
        ul.append(li);
        console.log("Loaded settings for:", module.name);
      }
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
