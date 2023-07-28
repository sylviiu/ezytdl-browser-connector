const sendRequest = ({
    cookies=false,
    tab=null,
    url=null,
}={}) => new Promise(async res => {
    if(!tab) tab = await browser.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]);

    console.log(`sendRequest`, { cookies, tab, url });

    const parseWithUrl = async (url, headers) => {
        const useCookies = cookies ? (await getCookies(url)) : null;
        
        console.log(`parseWithUrl`, url, headers, useCookies);

        const obj = { 
            query: url, 
            headers: headers,
            cookies: useCookies
        }

        console.log(`sendRequest obj`, obj)

        await send({ type: `listFormats`, data: obj });

        res();
    };

    const getCommonHeaders = () => {
        let headers = {};

        const tabHeaders = headersMap.has(tab.id) ? headersMap.get(tab.id) : ((headersMap.entries().next().value || [])[1]);
        
        headers['User-Agent'] = tabHeaders?.['User-Agent'] || navigator.userAgent;
        headers['Accept-Language'] = tabHeaders?.['Accept-Language'] || `${navigator.languages.join(`,`)};q=0.9`;

        return headers;
    }

    const parseWithTab = (tab) => {
        let headers = getCommonHeaders();

        const tabHeaders = headersMap.has(tab.id) ? headersMap.get(tab.id) : {};

        if(tabHeaders['Referer']) headers['Referer'] = tabHeaders['Referer']
        
        parseWithUrl(tab.url, headers);
    }

    if(url) {
        let headers = getCommonHeaders();

        parseWithUrl(url, headers)
    } else {
        console.log(`sendRequest tab`, tab)

        if(tab && typeof tab.id == `number` && tab.id != -1) {
            parseWithTab(tab);
        } else {
            console.error(`[sendRequest] no tab!`);
            res(null);
        }
    }
})