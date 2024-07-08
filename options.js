globalThis.browser ??= chrome;

function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

async function saveOptions(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll("ul#module-list > li > input");
  let moduleOptions = {};
  inputs.forEach(async (input) => {
    console.log(input.id, input.checked);
    if (input.checked) {
      const liinputs = document.querySelectorAll(
        "ul#module-list > li > ul > li > input"
      );
      moduleOptions[input.id] = {};
      liinputs.forEach(async (liinput) => {
        if (liinput.checked) {
          moduleOptions[input.id][liinput.id] = true;
        }
      });
    }
  });
  console.log("set:", moduleOptions);
  await browser.storage.sync.set({ moduleOptions });
}

function saveRestore(event) {
  try {
    saveOptions(event);
    restoreOptions();
  } catch (error) {
    console.error("error saving options:", error);
  }
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
    removeAllChildren(ul);
    moduleList.forEach((module) => {
      if (module) {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const input = document.createElement("input");

        label.setAttribute("for", module.id);
        label.title = module.description || "";
        label.textContent = module.name;

        input.type = "checkbox";
        input.id = module.id;
        input.checked = !!moduleOptions[module.id];

        li.append(label, input);
        input.addEventListener("change", saveRestore);

        const liul = document.createElement("ul");
        module.options.forEach((option) => {
          const lili = document.createElement("li");
          const lilabel = document.createElement("label");
          const liinput = document.createElement("input");

          lilabel.setAttribute("for", option.id);
          lilabel.textContent = option.name;
          lilabel.title = option.description || "";

          liinput.type = "checkbox";
          liinput.id = option.id;
          liinput.checked =
            !!moduleOptions[module.id]?.[option.id] || module.default || false;
          liinput.disabled = !moduleOptions[module.id];
          liinput.addEventListener("change", saveRestore);

          lili.append(lilabel, liinput);
          liul.append(lili);
        });
        li.append(liul);
        ul.append(li);
        console.log("Loaded settings for:", module.name);
      }
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
