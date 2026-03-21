// Injected into the page context by the content script
(function() {
  // Only inject once
  if (window.__swaggerUiInjected) return;
  window.__swaggerUiInjected = true;

  // Helper to inject JS/CSS
  function injectScript(src, id) {
    if (document.getElementById(id)) return;
    var s = document.createElement('script');
    s.src = src;
    s.id = id;
    s.type = 'text/javascript';
    document.head.appendChild(s);
  }
  function injectCss(href, id) {
    if (document.getElementById(id)) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.type = 'text/css';
    l.href = href;
    l.id = id;
    document.head.appendChild(l);
  }

  // Listen for postMessage from content script
  window.addEventListener('message', async function(event) {
    if (!event.data || event.data.type !== 'SHOW_SWAGGER_UI') return;
    // Inject CSS/JS if needed
    injectCss(event.data.cssUrl, 'swagger-ui-css');
    injectScript(event.data.jsYamlUrl, 'js-yaml-js');
    injectScript(event.data.swaggerUiUrl, 'swagger-ui-js');

    // Wait for SwaggerUIBundle and jsyaml
    function waitForGlobal(name, maxTries = 40) {
      return new Promise(resolve => {
        let tries = 0;
        function check() {
          if (window[name]) return resolve(window[name]);
          tries++;
          if (tries < maxTries) setTimeout(check, 50);
          else resolve(undefined);
        }
        check();
      });
    }
    const [SwaggerUIBundle, jsyaml] = await Promise.all([
      waitForGlobal('SwaggerUIBundle'),
      waitForGlobal('jsyaml')
    ]);
    if (!SwaggerUIBundle || !jsyaml) {
      alert('Failed to load Swagger UI or js-yaml');
      return;
    }
    // Fetch and parse the OpenAPI spec
    const res = await fetch(event.data.openapiUrl);
    const yamlText = await res.text();
    const spec = jsyaml.load(yamlText);
    // Set the server to the current one
    if (spec.servers && spec.servers.length > 0) {
      spec.servers = [{ url: event.data.currentServer }];
    }
    // Create container
    let container = document.getElementById('swagger-ui-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'swagger-ui-container';
      container.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;background:white;overflow:auto;';
      document.body.appendChild(container);
    }
    // Get access token from sessionStorage
    let accessToken = null;
    try {
      accessToken = sessionStorage.getItem('access_token');
      console.log('Got access token from sessionStorage:', accessToken);
    } catch (e) {}

    // Request interceptor to add Authorization header for /UserInfo
    function requestInterceptor(req) {
      if (
        accessToken &&
        req.url &&
        /\/UserInfo(\?|$)/.test(req.url)
      ) {
        req.headers = req.headers || {};
        req.headers['Authorization'] = 'Bearer ' + accessToken;
      }
      return req;
    }

    const ui = SwaggerUIBundle({
      domNode: container,
      spec,
      presets: [SwaggerUIBundle.presets.apis],
      layout: 'BaseLayout',
      docExpansion: 'none',
      deepLinking: true,
      requestInterceptor,
    });
    // Pre-fill the Authorization field in the UI
    if (accessToken) {
      // Wait a tick to ensure UI is ready
      setTimeout(() => {
        try {
          ui.preauthorizeApiKey && ui.preauthorizeApiKey('bearerAuth', 'Bearer ' + accessToken);
        } catch (e) { console.warn('SwaggerUI preauthorizeApiKey failed', e); }
      }, 100);
    }
  });
})();
