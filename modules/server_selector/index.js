const name = "Szerver kiválasztó";
const id = "server_selector";
const description = "Lehetővé teszi szerver váltását a login felületen.";
const options = [
  {
    name: "szabad helyek mutatása",
    description: "Kiírja, hogy melyik szerveren hány szabad hely van még.",
    id: "show_remaining_session",
    type: "checkbox",
    value: false,
  },
];

function getOption(option) {
  return options.find((item) => item.id == option).value;
}

async function loadContentScript(browser, document, window) {
  const utils = await import(browser.runtime.getURL('../utils.js'));

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
        { action: "fetch", url: url + '/api/General/EnvironmentData' },
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
      const loginForm = document.querySelector('.login-right');
      if (loginForm) {
        const serverSelector = document.createElement('div');
        serverSelector.classList.add('server-selector');
        serverSelector.innerHTML = `
          <select id="server-dropdown" name="server">
          </select>
        `;
        loginForm.insertBefore(serverSelector, loginForm.firstChild.nextSibling);

        const serverSelect = document.getElementById('server-dropdown');
        serverSelect.style = "background-color: #f2f3fb;border: 10px solid #f2f3fb;padding: 5px;border-radius: 10px;font-family: LatoWeb,sans-serif;font-weight: 900;color: #213055;margin: 20px 0 0 0;font-size: 16px;";
        serverSelect.addEventListener('change', (event) => {
          window.location.href = event.target.value;
        });
        serverSelect.disabled = true;
        getCurrentServer().then(async data => {
          for (const server of data) {
            const option = document.createElement('option');
            option.value = server.url;
            if (getOption('show_remaining_session')) {
              const remainingSession = await getServerRemainingSession(server.url);
              option.textContent = server.server_name + ' (' + remainingSession + ')';
            } else {
              option.textContent = server.server_name;
            }
            serverSelect.appendChild(option);
            if (server.url.includes(window.location.host))
              serverSelect.value = server.url;
          }
          serverSelect.disabled = false;
        });
      }
    }
  }

  utils.tryToRun(tryAddServerSelector);  
}

export {
  name,
  id,
  description,
  options,
  loadContentScript
};