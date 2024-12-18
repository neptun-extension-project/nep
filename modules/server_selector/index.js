const name = "szerver kiválasztó";
const id = "server_selector";
const description = "TODO";
const options = [];

// Parts of this function were written by Cluade 3.5 Sonnet
function loadContentScript(browser, document) {
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

  async function getServerRemainingSession(url) {
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage(
        { action: "fetch", url: url + '/api/General/GetEnvironmentData' },
        (response) => {
          if (response.success) {
            const responseObject = JSON.parse(response.data);
            resolve(responseObject.data.remainingSession);
          } else {
            console.error("Error:", response.error);
            reject(response.error);
          }
        }
      );
    });
  }

  async function tryAddServerSelector() {
    if (!document.querySelector(".server-selector")) {
      const loginForm = document.querySelector('neptun-login-form');
      if (loginForm) {
        const serverSelector = document.createElement('div');
        serverSelector.classList.add('server-selector');
        serverSelector.innerHTML = `
          <label for="server">Szerver:</label>
          <select id="server" name="server">
          </select>
        `;
        loginForm.appendChild(serverSelector);

        const serverSelect = document.getElementById('server');
        serverSelect.addEventListener('change', (event) => {
          window.location.href = event.target.value;
        });
        serverSelect.disabled = true;
        getCurrentServer().then(async data => {
          for (const server of data) {
            const option = document.createElement('option');
            option.value = server.url;
            const remainingSession = await getServerRemainingSession(server.url);
            option.textContent = server.server_name + ' (' + remainingSession + ')';
            serverSelect.appendChild(option);
            if (server.url.includes(window.location.host))
              serverSelect.value = server.url;
          }
          serverSelect.disabled = false;
        });
      }
    }
  }

  // Initial set
  tryAddServerSelector();

  // Set up MutationObserver to watch for changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        tryAddServerSelector();
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
  setInterval(tryAddServerSelector, 1000); // Check every 1000ms (1 second)

  // Also set the text when the page gains focus
  window.addEventListener('focus', tryAddServerSelector);
}

export {
  name,
  id,
  description,
  options,
  loadContentScript
};