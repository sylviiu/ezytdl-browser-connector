stateObj.hooks.push(({status, session}={}) => {
    if(session) {
        chrome.action.setTitle({ title: `ezytdl: connected to ${session.name} v${session.version}` })
    } else {
        chrome.action.setTitle({ title: `ezytdl: not connected` })
    }

    if(status == `ready`) {
        chrome.action.setIcon({ path: `../res/icon-enabled.png` }).then(() => console.log(`icon set!`))
        chrome.action.setBadgeBackgroundColor({ color: `#00FF00` });
        chrome.action.setBadgeText({ text: `•` });
    } else if(status) {
        chrome.action.setIcon({ path: `../res/icon-disabled.png` }).then(() => console.log(`icon set!`))
        chrome.action.setBadgeText({ text: `` });
    }
})