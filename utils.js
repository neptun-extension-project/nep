async function getCurrentNeptunServers(browser) {
    const serverDataUrl = browser.runtime.getURL("server_data.json");
    const currentHost = window.location.host;

    return await fetch(serverDataUrl)
        .then(response => response.json())
        .then(data => {
            for (const name in data) {
                for (const serverData of data[name]) {
                    if (serverData.url.includes(currentHost)) {
                        return data[name];
                    }
                }
            }
            return [];
        });
}

async function getCurrentNeptunUrl(browser) {
    const servers = await getCurrentNeptunServers(browser);
    for (const server of servers) {
        if (server.url.includes(window.location.host)) {
            return server.url;
        }
    }
    return null;
}

// Parts of this function were written by Cluade 3.5 Sonnet
function tryToRun(fn) {
    fn();

    // Set up MutationObserver to watch for changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                fn();
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Periodically check and set the text
    setInterval(fn, 1000); // Check every 1000ms (1 second)

    // Also set the text when the page gains focus
    window.addEventListener('focus', fn);
}

export { getCurrentNeptunServers, getCurrentNeptunUrl, tryToRun };
