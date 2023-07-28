const headersMap = new Map();

browser.webRequest.onBeforeSendHeaders.addListener(details => {
    if(details.type == `main_frame` && details.tabId != -1) {
        const headersObj = {};

        details.requestHeaders.forEach(({ name, value }) => headersObj[name] = value);

        headersMap.set(details.tabId, headersObj);

        console.log("Tab opened - Tab ID:", details.tabId, headersObj);
    }
}, { urls: [`<all_urls>`], types: [`main_frame`] }, [`requestHeaders`]);

browser.tabs.onRemoved.addListener((tabId) => {
    console.log("Tab closed - Tab ID:", tabId);

    if(headersMap.has(tabId)) {
        headersMap.delete(tabId);
        console.log("Tab closed - Deleted tab from headers map:", tabId);
    }
});