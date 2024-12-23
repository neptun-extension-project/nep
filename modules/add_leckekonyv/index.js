const name = "Leckekönyv menüpont";
const id = "add_leckekonyv";
const description = "Visszahozza a Leckekönyv menüpontot.";
const options = [];

async function loadContentScript(browser, document) {
    const utils = await import(browser.runtime.getURL('../utils.js'));

    const neptunUrl = await utils.getCurrentNeptunUrl(browser);
    async function tryAddMenuitem() {
        const menus = document.querySelectorAll(".mat-toolbar-multiple-rows");
        const leckekonyvMenuitem = document.getElementById('leckekonyv-menuitem');
        if (leckekonyvMenuitem) {
            console.log('Leckekönyv menuitem already exists, not adding again');
            return;
        }
        for (const menu of menus) {
            if (menu.textContent.includes('Tanulmányok főmenü')) {
                console.log('Tanulmányok főmenü found, adding Leckekönyv menuitem');
                const menuitem = document.createElement('mat-toolbar-row');
                menuitem.id = 'leckekonyv-menuitem';
                menuitem.classList.add('mat-toolbar-row', 'row', 'ng-star-inserted');
                const a = document.createElement('a');
                a.classList.add('mat-toolbar-row', 'mat-mdc-menu-item', 'mat-mdc-focus-indicator', 'mdc-list-item', 'mat-mdc-tooltip-trigger', 'menu-item', 'menu-item--inner', 'link-focus', 'ng-star-inserted');
                a.href = neptunUrl+'/studies/advancement/registry-sheet/';
                a.style = 'padding: 0 0;';
                const span = document.createElement('span');
                span.classList.add('mdc-list-item__primary-text');
                span.textContent = 'Leckekönyv';
                a.appendChild(span);
                menuitem.appendChild(a);
                menu.insertBefore(menuitem, menu.firstChild.nextSibling.nextSibling);
                break;
            }
        }
    }

    utils.tryToRun(tryAddMenuitem);
}

export {
    name,
    id,
    description,
    options,
    loadContentScript,
};