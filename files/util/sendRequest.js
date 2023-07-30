const sendRequest = ({
    cookies=false,
    url=null,
}={}) => new Promise(async res => {
    console.log(`sendRequest`, { cookies, url });

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
        let headers = {
            "User-Agent": navigator.userAgent,
            "Accept-Language": `${navigator.languages.join(`,`)};q=0.9`,
        };

        return headers;
    }

    if(url) {
        let headers = getCommonHeaders();

        parseWithUrl(url, headers)
    } else console.log(`no url!`)
})