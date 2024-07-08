const modulePaths = [
  "modules/kitty_mode/kitty_mode.js",
  "modules/dark_theme/index.js",
];

async function getModules() {
  try {
    const modulePromises = modulePaths.map(async (path) => {
      try {
        const moduleUrl = browser.runtime.getURL(path);
        const module = await import(moduleUrl);
        console.log(`Loaded module: ${module.name} from ${path}`);
        return module;
      } catch (error) {
        console.error(`Failed to load module from ${path}:`, error);
        return null;
      }
    });

    const loadedModules = await Promise.all(modulePromises);
    return loadedModules.filter((module) => module !== null);
  } catch (error) {
    console.error("Error in getModules:", error);
    return [];
  }
}

async function getEnabledModules() {
  const modules = await getModules();
  const moduleOptions =
    (await browser.storage.sync.get("moduleOptions")).moduleOptions || {};
  console.log("got:", moduleOptions);
  return modules.filter((module) => moduleOptions[module.id]);
}

export { getModules, getEnabledModules };
