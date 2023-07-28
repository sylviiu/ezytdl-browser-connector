const sendRequest = ({
    cookies=false,
    tab=null,
    url=null,
}={}) => new Promise(async res => {
    if(!tab) tab = await browser.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]);

    console.log(`sendRequest`, { cookies, tab, url });

    const parseWithUrl = (url, headers) => {
        console.log(`parseWithUrl`, url, headers);

        const obj = { 
            query: url, 
            headers: headers
        }

        console.log(`sendRequest obj`, obj)

        send({ type: `listFormats`, data: obj }).then(res);
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

        console.log(`tabHeaders from background`, tabHeaders);

        if(tabHeaders['Referer']) headers['Referer'] = tabHeaders['Referer']
        if(tabHeaders['Cookie'] && cookies) headers.Cookie = tabHeaders['Cookie'];
        
        parseWithUrl(tab.url, headers);
    }

    if(url) {
        let headers = getCommonHeaders();

        if(cookies) {
            const parsedURL = new URL(url);

            const filter = (o, secure) => o.filter(o2 => secure ? o2.secure : !o2.secure).map(o2 => `${o2.name}=${o2.value}`).join(`; `)

            console.log(`parsedURL`, parsedURL)

            const cookie = await browser.cookies.getAll({ domain: parsedURL.hostname.split(`.`).slice(-2).join(`.`) });

            console.log(`cookie`, cookie)

            const filteredCookie = filter(cookie, parsedURL.protocol == `https:`);

            console.log(`filteredCookie`, filteredCookie)
            
            if(filteredCookie) headers.Cookie = filteredCookie;
        }

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