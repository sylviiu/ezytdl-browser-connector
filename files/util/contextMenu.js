const contextMenus = {
    "send-with-cookies": {
        title: `Send to ezytdl (with cookies)`,
        handler: ({info, tab}) => sendRequest({ cookies: true, tab, url: info.linkUrl || (!headersMap.has(tab.id) ? info.pageUrl : null) })
    },
    "send-plain": {
        title: `Send to ezytdl`,
        handler: ({info, tab}) => sendRequest({ tab, url: info.linkUrl || (!headersMap.has(tab.id) ? info.pageUrl : null) })
    }
}

console.log(`creating context menu listener!`);

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const thisContext = contextMenus[info.menuItemId];

    console.log(`context menu clicked!`, info, tab, thisContext);

    if(thisContext && thisContext.handler) thisContext.handler({ info, tab });
});

if(chrome.runtime.lastError) console.error(`failed to create context menu listener!`, chrome.runtime.lastError);

chrome.runtime.onInstalled.addListener(() => {
    console.log(`creating context menus!`);

    chrome.contextMenus.create({
        title: `Send to ezytdl`,
        id: `parent`,
        contexts: [ `page`, `link` ],
    });

    Object.entries(contextMenus).forEach(([ id, obj ]) => {
        chrome.contextMenus.create(Object.assign(JSON.parse(JSON.stringify(obj)), {
            id,
            parentId: `parent`,
            contexts: [ `page`, `link` ],
        }));

        console.log(`created context menu!`, id, obj);
    });
});