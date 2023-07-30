const contextMenus = {
    "send-with-cookies": {
        title: `Send to ezytdl (with cookies)`,
        handler: ({info}) => sendRequest({ cookies: true, url: info.linkUrl || info.pageUrl })
    },
    "send-plain": {
        title: `Send to ezytdl`,
        handler: ({info}) => sendRequest({ url: info.linkUrl || info.pageUrl })
    }
}

console.log(`creating context menu listener!`);

chrome.contextMenus.onClicked.addListener((info) => {
    const thisContext = contextMenus[info.menuItemId];

    console.log(`context menu clicked!`, info, thisContext);

    if(thisContext && thisContext.handler) thisContext.handler({ info });
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