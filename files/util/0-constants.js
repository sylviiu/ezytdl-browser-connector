if(typeof browser == `undefined`) var browser = chrome;

const vars = {
    manifestData: chrome.runtime.getManifest(),
    socketStates: [`CONNECTING`, `OPEN`, `CLOSING`, `CLOSED`],
    serviceWorker: typeof importScripts == `function`,
}

const comms = {
    hello: {
        extension_name: vars.manifestData.name,
        extension_version: vars.manifestData.version,
        extension_id: chrome.runtime.id,
        manifest_version: vars.manifestData.manifest_version,
        user_agent: navigator.userAgent,
    }
}