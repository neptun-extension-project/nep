import { embedSwaggerUI } from './embed.js';

function addSwaggerUIButton() {
  if (document.getElementById('swagger-ui-open-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'swagger-ui-open-btn';
  btn.textContent = 'Open Swagger UI';
  btn.style = 'padding:10px 18px;background:#white;border:none;border-radius:6px;cursor:pointer;font-size:16px;';
  btn.onclick = embedSwaggerUI;
  try {
  document.getElementsByClassName('footer__content')[0].appendChild(btn);
  } catch (e) {
    console.error('Failed to append Swagger UI button:', e);
  }
}

const utils = await import(browser.runtime.getURL('../utils.js'));
utils.tryToRun(addSwaggerUIButton);
