// Mostly vibecoded with GPT-4.1
// TODO: Refactor

function injectPageScript() {
    // Inject the page context script if not already present
    if (!document.getElementById('swagger-ui-injector')) {
        const script = document.createElement('script');
        script.id = 'swagger-ui-injector';
        script.src = chrome.runtime.getURL('modules/swagger_ui/inject.js');
        script.type = 'text/javascript';
        document.documentElement.appendChild(script);
    }
}

async function getCurrentServer() {
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

// Get current server from the page (customize as needed)
async function getCurrentServerUrl() {
    // Example: extract from window.location or a global variable
    // This should be customized to your app's logic
    const servers = await getCurrentServer();
    if (servers.length > 0) {
        return servers[0].url + 'api'; // Use the first matched server
    }
    return window.location.origin + '/hallgato_ng/api'; // Fallback
}

// Inject Swagger UI into the page
export async function embedSwaggerUI() {
    injectPageScript();
    // Post a message to the page context to show Swagger UI
    window.postMessage({
        type: 'SHOW_SWAGGER_UI',
        openapiUrl: chrome.runtime.getURL('modules/swagger_ui/openapi.yaml'),
        cssUrl: chrome.runtime.getURL('modules/swagger_ui/lib/swagger-ui.css'),
        swaggerUiUrl: chrome.runtime.getURL('modules/swagger_ui/lib/swagger-ui-bundle.js'),
        jsYamlUrl: chrome.runtime.getURL('modules/swagger_ui/lib/js-yaml.js'),
        currentServer: await getCurrentServerUrl(),
    }, '*');
}

// Optionally, add a keyboard shortcut to open Swagger UI
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'S') {
        embedSwaggerUI();
    }
});