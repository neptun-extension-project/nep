async function fetchLabels(win) {
    return win.__neptun_ext_translationService.translocoService.translations.get(win.__neptun_ext_translationService.translocoService.defaultLang);
}

const CUSTOM_FAVORITE_TYPE = "customFavorite";
const MENU_READY_LOCK_KEY = "__nep_menu_ready_lock";

let isMenuReadyListenerRegistered = false;
let isMenuReadyHandled = false;

function getLabel(labels, key) {
    const value = labels[key];
    return typeof value === 'string' ? value : key;
}

const favoritesState = {
    loaded: false,
    ids: [],
    editMode: false,
    draftIds: [],
    customFavorites: [],
    draftCustomFavorites: [],
};

function getAccessToken() {
    try {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    } catch (error) {
        console.warn('[Menu] Failed to read access token:', error);
        return null;
    }
}

function parseFavoritesInnerPayload(rawPayload) {
    if (!rawPayload) {
        return [];
    }

    try {
        const parsed = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("[Menu] Failed to parse favourites inner payload:", error);
        return [];
    }
}

function sanitizeCustomFavorite(customFavorite, fallbackId) {
    if (!customFavorite || typeof customFavorite !== "object") {
        return null;
    }

    const url = typeof customFavorite.url === "string" ? customFavorite.url.trim() : "";
    const label = typeof customFavorite.label === "string" ? customFavorite.label.trim() : "";
    const id = typeof customFavorite.id === "string" && customFavorite.id
        ? customFavorite.id
        : fallbackId;

    if (!url || !label) {
        return null;
    }

    try {
        new URL(url);
    } catch {
        return null;
    }

    return { id, url, label };
}


async function getCurrentServerUrl() {
    return document.querySelector('base')?.href+'/api/';
}

async function buildApiUrl(win, apiPath) {
    const serverUrl = await getCurrentServerUrl();
    return new URL(apiPath, serverUrl).href;
}

async function loadFavorites(win) {
    const accessToken = getAccessToken();
    if (!accessToken) {
        return {
            ids: [],
            customFavorites: [],
        };
    }

    try {
        const getApiUrl = await buildApiUrl(win, 'Profiles/Favourites');
        const response = await fetch(getApiUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            console.warn('[Menu] Failed to load favourites from API:', response.status, response.statusText);
            return [];
        }

        const payload = await response.json();
        if (!Array.isArray(payload?.data)) {
            return {
                ids: [],
                customFavorites: [],
            };
        }

        const innerPayload = parseFavoritesInnerPayload(payload.data[0]?.favouriteMenuId);
        const ids = [];
        const customFavorites = [];

        innerPayload.forEach((entry, index) => {
            const favoriteId = entry && entry.favouriteMenuId;
            if (typeof favoriteId === "string" && !favoriteId.startsWith("__custom__")) {
                ids.push(favoriteId);
                return;
            }

            if (entry?.type === CUSTOM_FAVORITE_TYPE) {
                const customFavorite = sanitizeCustomFavorite(entry.data, `custom:${index}`);
                if (customFavorite) {
                    customFavorites.push(customFavorite);
                }
            }
        });

        return {
            ids,
            customFavorites,
        };
    } catch (error) {
        console.error('[Menu] Failed to load favourites from API:', error);
        return {
            ids: [],
            customFavorites: [],
        };
    }
}

async function saveFavorites(favoriteIds, customFavorites, win) {
    const accessToken = getAccessToken();
    if (!accessToken) {
        return false;
    }

    const validFavoriteIds = Array.isArray(favoriteIds)
        ? favoriteIds.filter((favoriteId) => typeof favoriteId === "string" && favoriteId)
        : [];

    const validCustomFavorites = Array.isArray(customFavorites)
        ? customFavorites
            .map((customFavorite, index) => sanitizeCustomFavorite(customFavorite, `custom:${index}`))
            .filter(Boolean)
        : [];

    const payloadItems = [
        ...validFavoriteIds.map((favouriteMenuId) => ({ favouriteMenuId })),
        ...validCustomFavorites.map((customFavorite) => ({
            favouriteMenuId: `__custom__:${customFavorite.id}`,
            type: CUSTOM_FAVORITE_TYPE,
            data: customFavorite,
        })),
    ];

    try {
        const response = await fetch(await buildApiUrl(win, 'ContextUserProfile/SaveFavouriteMenu'), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                favourites: [
                    {
                        favouriteMenuId: JSON.stringify(payloadItems),
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.warn('[Menu] Failed to save favourites to API:', response.status, response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Menu] Failed to save favourites to API:', error);
        return false;
    }
}

function normalizeSegment(segment) {
    return String(segment || "")
        .trim()
        .replace(/^\/+|\/+$/g, "");
}

function joinRouterSegments(...segments) {
    return segments
        .flatMap((segment) => String(segment || "").split("/"))
        .map(normalizeSegment)
        .filter(Boolean)
        .join("/");
}

function isVisibleMenuItem(item) {
    return item && item.accessMode !== "hidden";
}

function getMenuItems(menuData) {
    if (Array.isArray(menuData)) {
        return menuData;
    }

    if (Array.isArray(menuData?.items)) {
        return menuData.items;
    }

    return [];
}

function detachMenuData(pageWindow, rawMenuData) {
    if (!rawMenuData) {
        return [];
    }

    try {
        const serializedMenuData = pageWindow.JSON.stringify(rawMenuData);
        return JSON.parse(serializedMenuData);
    } catch (error) {
        console.error("[Content Script] Failed to detach menu data:", error);
        return [];
    }
}

function findRouteBasePath(win, menuItems) {
    const pathSegments = win.location.pathname
        .split("/")
        .map(normalizeSegment)
        .filter(Boolean);

    const routeCandidates = [];

    menuItems.forEach((item) => {
        routeCandidates.push(joinRouterSegments(item.routerLink));

        (item.children || []).forEach((child) => {
            routeCandidates.push(joinRouterSegments(item.routerLink, child.routerLink));
        });
    });

    const normalizedCandidates = routeCandidates
        .map((candidate) => candidate.split("/").filter(Boolean))
        .filter((candidate) => candidate.length);

    for (let index = 0; index < pathSegments.length; index += 1) {
        const remainingPath = pathSegments.slice(index);
        const matchesRoute = normalizedCandidates.some((candidate) =>
            candidate.every((segment, candidateIndex) => remainingPath[candidateIndex] === segment)
        );

        if (matchesRoute) {
            return `/${pathSegments.slice(0, index).join("/")}`.replace(/\/+$/g, "") || "/";
        }
    }

    const fallbackSegments = pathSegments.slice(0, Math.max(pathSegments.length - 1, 0));
    return `/${fallbackSegments.join("/")}`.replace(/\/+$/g, "") || "/";
}

function createMenuHref(win, routeBasePath, routePath) {
    const normalizedBasePath = routeBasePath === "/" ? "" : routeBasePath;
    const combinedPath = joinRouterSegments(normalizedBasePath, routePath);
    return new URL(`/${combinedPath}`, win.location.origin).href;
}

function favoriteIdFromPath(path, fallbackKey) {
    const normalizedPath = normalizeSegment(path);
    if (normalizedPath) {
        return normalizedPath;
    }

    return `root:${String(fallbackKey || "item")}`;
}

function buildFavoriteCandidates(win, routeBasePath, menuItems, labels) {
    const candidates = [];

    menuItems.filter(isVisibleMenuItem).forEach((item) => {
        const itemPath = joinRouterSegments(item.routerLink);
        candidates.push({
            id: favoriteIdFromPath(itemPath, item.key),
            label: getLabel(labels, item.stringResource),
            href: createMenuHref(win, routeBasePath, itemPath),
        });

        (item.children || [])
            .filter(isVisibleMenuItem)
            .forEach((child) => {
                const childPath = joinRouterSegments(item.routerLink, child.routerLink);
                candidates.push({
                    id: favoriteIdFromPath(childPath, `${item.key}/${child.key}`),
                    label: `${getLabel(labels, item.stringResource)} / ${getLabel(labels, child.stringResource)}`,
                    href: createMenuHref(win, routeBasePath, childPath),
                });
            });
    });

    return candidates;
}

async function ensureFavoriteState(win, candidates) {
    const candidateIds = new Set(candidates.map((candidate) => candidate.id));

    if (!favoritesState.loaded) {
        const loadedFavorites = await loadFavorites(win);
        favoritesState.ids = Array.isArray(loadedFavorites?.ids)
            ? loadedFavorites.ids.filter((favoriteId) => candidateIds.has(favoriteId))
            : [];
        favoritesState.customFavorites = Array.isArray(loadedFavorites?.customFavorites)
            ? loadedFavorites.customFavorites
            : [];
        favoritesState.loaded = true;
    } else {
        favoritesState.ids = favoritesState.ids.filter((favoriteId) => candidateIds.has(favoriteId));
    }

    favoritesState.draftIds = favoritesState.draftIds.filter((favoriteId) => candidateIds.has(favoriteId));
}

function injectMenuStyles(document) {
    if (document.getElementById("nep-horizontal-menu-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "nep-horizontal-menu-style";
    style.textContent = `
    .header__left > neptun-main-menu {
      display: none !important;
    }

    #menu-btn {
      display: none !important;
    }

    .nep-horizontal-menu {
      display: flex;
      align-items: stretch;
      gap: 0.2rem;
      margin-left: 1rem;
      min-width: 0;
      position: relative;
      flex: 0 1 auto;
      align-self: center;
      z-index: 40;
    }

    .nep-horizontal-menu__item {
      position: relative;
      flex: 0 0 auto;
    }

    .nep-horizontal-menu__link,
    .nep-horizontal-menu__submenu-link {
      color: #213055;
      font-family: LatoWeb, sans-serif;
      text-decoration: none;
      transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
    }

    .nep-horizontal-menu__link {
      display: inline-flex;
      align-items: center;
      gap: 0.1rem;
      padding: 0.75rem 1.05rem;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.01em;
      line-height: 1;
      white-space: nowrap;
    }

    .nep-horizontal-menu__item--has-children .nep-horizontal-menu__link::after {
      content: "";
      width: 0.45rem;
      height: 0.45rem;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(45deg) translateY(-1px);
      opacity: 0.7;
    }

    .nep-horizontal-menu__item:hover .nep-horizontal-menu__link,
    .nep-horizontal-menu__item:focus-within .nep-horizontal-menu__link,
    .nep-horizontal-menu__item--active .nep-horizontal-menu__link {
      color: #0943d9;
    }

    .nep-horizontal-menu__submenu {
      position: absolute;
      top: calc(100%);
      left: 0;
      display: none;
      min-width: 16rem;
      padding: 0.45rem;
      border: 1px solid rgba(33, 48, 85, 0.08);
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 18px 40px rgba(33, 48, 85, 0.18);
      backdrop-filter: blur(8px);
    }

    .nep-horizontal-menu__item:hover .nep-horizontal-menu__submenu,
    .nep-horizontal-menu__item:focus-within .nep-horizontal-menu__submenu,
    .nep-horizontal-menu__item--edit-open .nep-horizontal-menu__submenu {
      display: block;
    }

    .nep-horizontal-menu__submenu-link {
      display: block;
      padding: 0.72rem 0.82rem;
      font-size: 0.93rem;
      font-weight: 700;
      line-height: 1.25;
    }

    .nep-horizontal-menu__submenu-link:hover,
    .nep-horizontal-menu__submenu-link:focus-visible {
      background: #f2f3fb;
      color: #10213f;
      outline: none;
    }

    .nep-horizontal-menu__submenu-section {
      border-top: 1px solid rgba(33, 48, 85, 0.12);
      margin-top: 0.45rem;
      padding-top: 0.45rem;
    }

    .nep-horizontal-menu__submenu-empty {
      display: block;
      padding: 0.72rem 0.82rem;
      font-size: 0.86rem;
      color: #52607f;
      font-weight: 700;
    }

    .nep-horizontal-menu__submenu-action {
      width: 100%;
      text-align: left;
      border: 0;
      background: #e9effb;
      color: #1d3f87;
      font-family: LatoWeb, sans-serif;
      font-weight: 800;
      font-size: 0.84rem;
      padding: 0.56rem 0.75rem;
      cursor: pointer;
    }

    .nep-horizontal-menu__submenu-action:hover {
      background: #dbe7ff;
    }

    .nep-horizontal-menu__favorites-grid {
      max-height: 19rem;
      overflow: auto;
      padding: 0.2rem 0;
      display: grid;
      gap: 0.15rem;
    }

    .nep-horizontal-menu__favorites-option {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.84rem;
      font-weight: 700;
      color: #213055;
      padding: 0.35rem 0.35rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .nep-horizontal-menu__favorites-option:hover {
      background: #f3f6fd;
    }

    .nep-horizontal-menu__favorites-actions {
      display: grid;
      gap: 0.28rem;
      margin-top: 0.4rem;
    }
    
    neptun-menu-search {
      display: none;
    }

    .nep-horizontal-menu__favorites-input {
      width: 100%;
      padding: 0.5rem;
      margin: 0.3rem 0.75rem;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 0.35rem;
      font-size: 0.84rem;
      font-family: LatoWeb, sans-serif;
    }

    .nep-horizontal-menu__favorites-input:focus {
      outline: none;
      border-color: #0943d9;
      box-shadow: 0 0 0 2px rgba(9, 67, 217, 0.1);
    }

    .nep-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .nep-modal-dialog {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 20px 60px rgba(33, 48, 85, 0.3);
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      font-family: LatoWeb, sans-serif;
    }

    .nep-modal-dialog__title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #213055;
      margin-bottom: 1.5rem;
    }

    .nep-modal-dialog__field {
      margin-bottom: 1rem;
    }

    .nep-modal-dialog__label {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: #213055;
      margin-bottom: 0.4rem;
    }

    .nep-modal-dialog__input {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 0.35rem;
      font-size: 0.88rem;
      font-family: LatoWeb, sans-serif;
      box-sizing: border-box;
    }

    .nep-modal-dialog__input:focus {
      outline: none;
      border-color: #0943d9;
      box-shadow: 0 0 0 2px rgba(9, 67, 217, 0.1);
    }

    .nep-modal-dialog__actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
      margin-top: 1.5rem;
    }

    .nep-modal-dialog__button {
      padding: 0.7rem 1rem;
      border: none;
      border-radius: 0.35rem;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      font-family: LatoWeb, sans-serif;
    }

    .nep-modal-dialog__button--primary {
      background: #0943d9;
      color: white;
      transition: background 120ms ease;
    }

    .nep-modal-dialog__button--primary:hover {
      background: #0836b0;
    }

    .nep-modal-dialog__button--secondary {
      background: #e9effb;
      color: #1d3f87;
      transition: background 120ms ease;
    }

    .nep-modal-dialog__button--secondary:hover {
      background: #dbe7ff;
    }

    @media (max-width: 1200px) {
      .nep-horizontal-menu {
        gap: 0.2rem;
        margin-left: 0.5rem;
      }

      .nep-horizontal-menu__link {
        padding: 0.65rem 0.72rem;
        font-size: 0.88rem;
      }
    }

    @media (max-width: 960px) {
      .header__left > neptun-main-menu {
        display: block !important;
      }

      .nep-horizontal-menu {
        display: none;
      }

      #menu-btn {
        display: inline-flex !important;
      }
    }
  `;

    document.head.appendChild(style);
}

function createLink(document, className, label, href) {
    const link = document.createElement("a");
    link.className = className;
    link.textContent = label;
    link.href = href;
    return link;
}

function createButton(document, className, label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
    });
    return button;
}

function showAddCustomFavoriteModal(document, win, rerenderMenu) {
    const overlay = document.createElement("div");
    overlay.className = "nep-modal-overlay";
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });

    const dialog = document.createElement("div");
    dialog.className = "nep-modal-dialog";

    const title = document.createElement("div");
    title.className = "nep-modal-dialog__title";
    title.textContent = "Add Custom Favorite";
    dialog.appendChild(title);

    // URL field
    const urlField = document.createElement("div");
    urlField.className = "nep-modal-dialog__field";

    const urlLabel = document.createElement("label");
    urlLabel.className = "nep-modal-dialog__label";
    urlLabel.textContent = "URL";
    urlField.appendChild(urlLabel);

    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.className = "nep-modal-dialog__input";
    urlInput.placeholder = "https://example.com";
    urlField.appendChild(urlInput);
    dialog.appendChild(urlField);

    // Label field
    const labelField = document.createElement("div");
    labelField.className = "nep-modal-dialog__field";

    const labelLabel = document.createElement("label");
    labelLabel.className = "nep-modal-dialog__label";
    labelLabel.textContent = "Label";
    labelField.appendChild(labelLabel);

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.className = "nep-modal-dialog__input";
    labelInput.placeholder = "My Favorite";
    labelField.appendChild(labelInput);
    dialog.appendChild(labelField);

    // Actions
    const actions = document.createElement("div");
    actions.className = "nep-modal-dialog__actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "nep-modal-dialog__button nep-modal-dialog__button--secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
        overlay.remove();
    });
    actions.appendChild(cancelBtn);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "nep-modal-dialog__button nep-modal-dialog__button--primary";
    addBtn.textContent = "Add";
    addBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        const label = labelInput.value.trim();

        if (!url || !label) {
            alert("Please fill in both URL and Label");
            return;
        }

        try {
            new URL(url);
        } catch (error) {
            alert("Please enter a valid URL");
            return;
        }

        favoritesState.draftCustomFavorites.push({ url, label, id: `custom:${Date.now()}` });
        overlay.remove();
        rerenderMenu();
    });
    actions.appendChild(addBtn);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    urlInput.focus();
}
async function buildFavoritesMenuItem(document, win, routeBasePath, currentPath, menuItems, rerenderMenu, labels) {
    const candidates = buildFavoriteCandidates(win, routeBasePath, menuItems, labels);
    await ensureFavoriteState(win, candidates);

    const itemWrapper = document.createElement("div");
    itemWrapper.className = "nep-horizontal-menu__item nep-horizontal-menu__item--has-children";
    if (favoritesState.editMode) {
        itemWrapper.classList.add("nep-horizontal-menu__item--edit-open");
    }

    const topLink = createLink(document, "nep-horizontal-menu__link", getLabel(labels, "menu.favorites"), "#");
    topLink.addEventListener("click", (event) => {
        event.preventDefault();
    });
    itemWrapper.appendChild(topLink);

    const submenu = document.createElement("div");
    submenu.className = "nep-horizontal-menu__submenu";

    if (favoritesState.editMode) {
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "nep-horizontal-menu__favorites-grid";

        const draftIds = new Set(favoritesState.draftIds);

        candidates.forEach((candidate) => {
            const optionLabel = document.createElement("label");
            optionLabel.className = "nep-horizontal-menu__favorites-option";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = draftIds.has(candidate.id);
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    draftIds.add(candidate.id);
                } else {
                    draftIds.delete(candidate.id);
                }
                favoritesState.draftIds = Array.from(draftIds);
            });

            const textNode = document.createElement("span");
            textNode.textContent = candidate.label;

            optionLabel.appendChild(checkbox);
            optionLabel.appendChild(textNode);
            optionsContainer.appendChild(optionLabel);
        });

        submenu.appendChild(optionsContainer);

        const customSection = document.createElement("div");
        customSection.className = "nep-horizontal-menu__submenu-section";

        const customTitle = document.createElement("div");
        customTitle.style.cssText = "font-weight: 800; font-size: 0.84rem; color: #213055; padding: 0.45rem 0.75rem;";
        customTitle.textContent = "Custom Favorites";
        customSection.appendChild(customTitle);

        const customFavoritesContainer = document.createElement("div");
        customFavoritesContainer.className = "nep-horizontal-menu__favorites-grid";

        favoritesState.draftCustomFavorites.forEach((favorite, index) => {
            const favoriteOption = document.createElement("div");
            favoriteOption.className = "nep-horizontal-menu__favorites-option";
            favoriteOption.style.cssText = "display: flex; justify-content: space-between; align-items: center;";

            const label = document.createElement("span");
            label.textContent = favorite.label;
            label.style.flex = "1";

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "x";
            deleteBtn.style.cssText = "background: none; border: none; cursor: pointer; color: #e74c3c; font-weight: bold; padding: 0; margin-left: 0.5rem;";
            deleteBtn.addEventListener("click", () => {
                favoritesState.draftCustomFavorites.splice(index, 1);
                rerenderMenu();
            });

            favoriteOption.appendChild(label);
            favoriteOption.appendChild(deleteBtn);
            customFavoritesContainer.appendChild(favoriteOption);
        });

        customSection.appendChild(customFavoritesContainer);
        submenu.appendChild(customSection);

        const addCustomSection = document.createElement("div");
        addCustomSection.className = "nep-horizontal-menu__submenu-section";

        const addCustomBtn = createButton(
            document,
            "nep-horizontal-menu__submenu-action",
            "Add Custom Favorite",
            () => {
                showAddCustomFavoriteModal(document, win, rerenderMenu);
            }
        );
        addCustomBtn.style.cssText = "margin: 0.5rem 0.75rem; width: calc(100% - 1.5rem);";
        addCustomSection.appendChild(addCustomBtn);
        submenu.appendChild(addCustomSection);

        const actions = document.createElement("div");
        actions.className = "nep-horizontal-menu__favorites-actions";
        actions.appendChild(
            createButton(document, "nep-horizontal-menu__submenu-action", "Save favourites", async () => {
                const favoriteIds = Array.from(new Set(favoritesState.draftIds));
                const customFavorites = Array.from(
                    new Map(
                        favoritesState.draftCustomFavorites.map((favorite) => [favorite.id, favorite])
                    ).values()
                );
                const saved = await saveFavorites(favoriteIds, customFavorites, win);

                if (!saved) {
                    console.warn('[Menu] Unable to save favourites, please try again.');
                    return;
                }

                favoritesState.ids = favoriteIds;
                favoritesState.customFavorites = customFavorites;

                favoritesState.editMode = false;
                favoritesState.draftCustomFavorites = [];
                rerenderMenu();
            })
        );
        actions.appendChild(
            createButton(document, "nep-horizontal-menu__submenu-action", "Cancel", () => {
                favoritesState.editMode = false;
                favoritesState.draftIds = [];
                favoritesState.draftCustomFavorites = [...favoritesState.customFavorites];
                rerenderMenu();
            })
        );
        submenu.appendChild(actions);
    } else {
        const favoriteIds = new Set(favoritesState.ids);
        const selectedFavorites = candidates.filter((candidate) => favoriteIds.has(candidate.id));
        const allFavorites = [...selectedFavorites, ...favoritesState.customFavorites];

        if (!allFavorites.length) {
            const emptyState = document.createElement("span");
            emptyState.className = "nep-horizontal-menu__submenu-empty";
            emptyState.textContent = "No favourites selected yet.";
            submenu.appendChild(emptyState);
        } else {
            allFavorites.forEach((favorite) => {
                const href = favorite.href || favorite.url;
                const link = createLink(document, "nep-horizontal-menu__submenu-link", favorite.label, href);
                submenu.appendChild(link);

                const favoritePath = new URL(href).pathname.replace(/\/+$/g, "") || "/";
                if (favoritePath === currentPath) {
                    itemWrapper.classList.add("nep-horizontal-menu__item--active");
                }
            });
        }

        const footer = document.createElement("div");
        footer.className = "nep-horizontal-menu__submenu-section";
        footer.appendChild(
            createButton(document, "nep-horizontal-menu__submenu-action", "Edit favourites", () => {
                favoritesState.editMode = true;
                favoritesState.draftIds = [...favoritesState.ids];
                favoritesState.draftCustomFavorites = [...favoritesState.customFavorites];
                rerenderMenu();
            })
        );
        submenu.appendChild(footer);
    }

    itemWrapper.appendChild(submenu);
    return itemWrapper;
}

async function buildHorizontalMenu(document, win, menuItems, rerenderMenu, labels) {
    const menu = document.createElement("nav");
    const routeBasePath = findRouteBasePath(win, menuItems);
    const currentPath = win.location.pathname.replace(/\/+$/g, "") || "/";

    menu.id = "nep-horizontal-menu";
    menu.className = "nep-horizontal-menu";
    menu.setAttribute("aria-label", "Neptun navigation");

    menuItems.filter(isVisibleMenuItem).forEach((item) => {
        const itemWrapper = document.createElement("div");
        const childItems = (item.children || []).filter(isVisibleMenuItem);
        const itemPath = joinRouterSegments(item.routerLink);
        const itemHref = createMenuHref(win, routeBasePath, itemPath);
        const itemPathname = new URL(itemHref).pathname.replace(/\/+$/g, "") || "/";

        itemWrapper.className = "nep-horizontal-menu__item";
        if (childItems.length) {
            itemWrapper.classList.add("nep-horizontal-menu__item--has-children");
        }
        if (itemPathname === currentPath) {
            itemWrapper.classList.add("nep-horizontal-menu__item--active");
        }

        itemWrapper.appendChild(
            createLink(document, "nep-horizontal-menu__link", getLabel(labels, item.stringResource), itemHref)
        );

        if (childItems.length) {
            const submenu = document.createElement("div");
            submenu.className = "nep-horizontal-menu__submenu";

            childItems.forEach((child) => {
                const childPath = joinRouterSegments(item.routerLink, child.routerLink);
                const childHref = createMenuHref(win, routeBasePath, childPath);
                const childPathname = new URL(childHref).pathname.replace(/\/+$/g, "") || "/";

                if (childPathname === currentPath) {
                    itemWrapper.classList.add("nep-horizontal-menu__item--active");
                }

                submenu.appendChild(
                    createLink(document, "nep-horizontal-menu__submenu-link", getLabel(labels, child.stringResource), childHref)
                );
            });

            itemWrapper.appendChild(submenu);
        }

        menu.appendChild(itemWrapper);
    });

    if (document.querySelector('meta[name="hide_favorites"]')?.content === "true") {
        return menu;
    }

    menu.appendChild(
        await buildFavoritesMenuItem(document, win, routeBasePath, currentPath, menuItems, rerenderMenu, labels)
    );

    return menu;
}

async function renderMenu(document, win, menuData) {
    const headerLeft = document.querySelector(".header__left");
    const menuItems = getMenuItems(menuData);

    if (!headerLeft || !menuItems.length) {
        return false;
    }

    injectMenuStyles(document);

    const oldButton = document.querySelector("#menu-btn");
    if (oldButton) {
        oldButton.style.display = "none";
    }

    const oldMainMenu = document.querySelector(".header__left > neptun-main-menu");
    if (oldMainMenu) {
        oldMainMenu.style.display = "none";
    }

    const existingMenu = document.getElementById("nep-horizontal-menu");
    if (existingMenu) {
        existingMenu.remove();
    }

    const labels = await fetchLabels(win);

    headerLeft.appendChild(
        await buildHorizontalMenu(document, win, menuItems, () => renderMenu(document, win, menuData), labels)
    );
    return true;
}

function renderMenuWhenReady(document, win, menuData) {
    return new Promise((resolve) => {
        let settled = false;
        let renderAttemptInProgress = false;
        let observer = null;

        const timeoutId = win.setTimeout(() => {
            finish(false);
        }, 10000);

        function finish(result) {
            if (settled) {
                return;
            }

            settled = true;
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            win.clearTimeout(timeoutId);
            resolve(result);
        }

        async function attemptRender() {
            if (settled || renderAttemptInProgress) {
                return;
            }

            renderAttemptInProgress = true;
            try {
                if (await renderMenu(document, win, menuData)) {
                    finish(true);
                }
            } finally {
                renderAttemptInProgress = false;
            }
        }

        observer = new MutationObserver(() => {
            attemptRender();
        });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }

        attemptRender();
    });
}

window.addEventListener("NeptunMenuReady", async () => {
    if (isMenuReadyHandled || window[MENU_READY_LOCK_KEY]) {
        return;
    }

    isMenuReadyHandled = true;
    window[MENU_READY_LOCK_KEY] = true;

    const pageWindow = window.wrappedJSObject || window;
    const menuData = detachMenuData(pageWindow, pageWindow.__neptun_ext_menu_data);

    await renderMenuWhenReady(document, pageWindow, menuData);
}, { once: true });