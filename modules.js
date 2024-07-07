const modulePaths = ["modules/kitty_mode/kitty_mode.js"];

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

export { getModules };
