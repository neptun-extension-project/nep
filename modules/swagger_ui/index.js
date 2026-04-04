export const id = 'swagger_ui';
export const name = 'Swagger UI';
export const options = [];

export function loadContentScript(browser, document, window) {
  import('./button.js');
}
