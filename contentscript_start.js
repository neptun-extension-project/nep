(function () {
    'use strict';

    function patchChunk(chunk) {
        const modules = chunk[1];
        if (!modules) return;

        for (let moduleId in modules) {
            let originalFn = modules[moduleId];
            let fnStr = originalFn.toString();
            let isModified = false;

            const menuRegex = /\w+\s*\=\s*this\.createMenu[^;]+;/;
            if (menuRegex.test(fnStr)) {
                const menuDataVar = fnStr.match(menuRegex)[0].split('=')[0].trim();
                fnStr = fnStr.replace(menuRegex, `$& window.__neptun_ext_menu_data = ${menuDataVar}; window.dispatchEvent(new Event('NeptunMenuReady'));`);
                isModified = true;
            }

            const translationServiceRegex = /this\.translationService\s*=\s*(\w+),/g;
            if (translationServiceRegex.test(fnStr)) {
                fnStr = fnStr.replace(translationServiceRegex, (match, p1) => {
                    return `this.translationService = ${p1}, window.__neptun_ext_translationService = ${p1},`;
                });
                isModified = true;
            }


            // P.sendMessagePermission -> true (bypass permission check)
            // const permissionRegex = /P\.sendMessagePermission/g;
            // if (permissionRegex.test(fnStr)) {
            //     fnStr = fnStr.replace(permissionRegex, "true");
            //     isModified = true;
            //     console.log(`[Interceptor] Patched P.sendMessagePermission in module ${moduleId}`);
            // }

            // %w+.isReplyToPostsEnabled -> true (bypass feature flag)
            // const featureFlagRegex = /(p|m\.o)\.isReplyToPostsEnabled/g;
            // if (featureFlagRegex.test(fnStr)) {
            //     fnStr = fnStr.replace(featureFlagRegex, "true");
            //     isModified = true;
            //     console.log(`[Interceptor] Patched isReplyToPostsEnabled flag in module ${moduleId}`);
            // }

            // %w+.isCommunicationEnabled -> true (bypass feature flag)
            // const communicationFlagRegex = /(p|m\.o)\.isCommunicationEnabled/g;
            // if (communicationFlagRegex.test(fnStr)) {
            //     fnStr = fnStr.replace(communicationFlagRegex, "true");
            //     isModified = true;
            //     console.log(`[Interceptor] Patched isCommunicationEnabled flag in module ${moduleId}`);
            // }


            // // 1. PATCH LIMIT
            // const limitRegex = /\.length\s*>=\s*8\)/g;
            // if (limitRegex.test(fnStr)) {
            //     fnStr = fnStr.replace(limitRegex, ".length >= 999)");
            //     isModified = true;
            //     console.log(`[Interceptor] Patched favorites limit in module ${moduleId}`);
            // }

            // // 2. PATCH LOAD
            // const loadRegex = /(processFavorites\s*\(\s*)([a-zA-Z0-9_]+)(\s*,\s*)([a-zA-Z0-9_]+)(\s*\)\s*\{)/g;
            // if (loadRegex.test(fnStr)) {
            //     fnStr = fnStr.replace(loadRegex, (match, p1, p2, p3, p4, p5) => {
            //         return `${p1}${p2}${p3}${p4}${p5} try { const _loc = localStorage.getItem('neptun_favs'); if(_loc) { ${p4} = JSON.parse(_loc); } } catch(e) {} `;
            //     });
            //     isModified = true;
            //     console.log(`[Interceptor] Patched processFavorites (Load) in module ${moduleId}`);
            // }

            // // 3. PATCH SAVE
            // const saveRegex = /(return\s+this\.userProfileService\.saveFavouriteMenu\(\s*\{\s*favourites\s*:\s*)([a-zA-Z0-9_]+)(\s*\}\s*\))/g;
            // if (saveRegex.test(fnStr)) {
            //     fnStr = fnStr.replace(saveRegex, (match, p1, p2, p3) => {
            //         return `
            //             localStorage.setItem('neptun_favs', JSON.stringify(${p2}));
            //             return { 
            //                 subscribe: function(obs) { 
            //                     let fn = typeof obs === 'function' ? obs : (obs && obs.next ? obs.next.bind(obs) : null); 
            //                     if (fn) fn({}); 
            //                     return { unsubscribe: () => {} }; 
            //                 }, 
            //                 pipe: function() { return this; }, 
            //                 toPromise: function() { return Promise.resolve({}); } 
            //             }; /* bypassed backend */
            //         `;
            //     });
            //     isModified = true;
            //     console.log(`[Interceptor] Patched saveFavouriteMenuItems (Save) in module ${moduleId}`);
            // }

            if (isModified) {
                try {
                    modules[moduleId] = eval(`(${fnStr})`);
                    console.log(`[Interceptor] Successfully recompiled module ${moduleId}`);
                } catch (e) {
                    console.error(`[Interceptor] Failed to recompile patched module ${moduleId}:`, e);
                }
            }
        }
    }

    // 1. Initialize the array safely
    let chunkArray = window.webpackChunkNeptun_Client = window.webpackChunkNeptun_Client || [];

    // 2. Wrap the native array push (Catches chunks loaded BEFORE Webpack boots)
    const nativePush = chunkArray.push;
    chunkArray.push = function (...args) {
        args.forEach(patchChunk);
        return nativePush.apply(this, args);
    };

    // 3. Protect against Webpack overwriting `.push` (Catches LAZY-LOADED chunks)
    let currentPush = chunkArray.push;

    Object.defineProperty(chunkArray, 'push', {
        get: function () {
            return currentPush;
        },
        set: function (webpackPush) {
            console.log("[Interceptor] Webpack is taking over .push. Wrapping it!");
            // Webpack just tried to overwrite `.push` with its own `webpackJsonpCallback`.
            // Instead of letting it destroy our hook, we wrap Webpack's function!
            currentPush = function (...args) {
                args.forEach(patchChunk);
                return webpackPush.apply(this, args);
            };
        },
        configurable: true,
        enumerable: true
    });

})();