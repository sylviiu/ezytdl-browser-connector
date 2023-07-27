// FULL CREDITS GO TO https://github.com/hrdl-github/cookies-txt

var browser = browser || chrome;

function formatCookie(co) {
    return [
        [
            co.httpOnly ? "#HttpOnly_" : "",
            !co.hostOnly && co.domain && !co.domain.startsWith(".") ? "." : "",
            co.domain,
        ].join(""),
        co.hostOnly ? "FALSE" : "TRUE",
        co.path,
        co.secure ? "TRUE" : "FALSE",
        co.session || !co.expirationDate ? 0 : co.expirationDate,
        co.name,
        co.value + "\n",
    ].join("\t");
}

const parseCookies = (filter={}) => new Promise(async (res, rej) => {
    const stores = await browser.cookies.getAllCookieStores();

    let header = [
        "# Netscape HTTP Cookie File\n",
        "# https://curl.haxx.se/rfc/cookie_spec.html\n",
        "# This is a generated file! Do not edit.\n\n",
    ];

    for (var store of stores) {
        console.log("Store: " + store.id);
        try {
            query = browser.runtime.getBrowserInfo().version >= "59.0" ? {
                ...stores.filter,
                ...{ storeId: store.id, firstPartyDomain: null },
            } : { 
                ...stores.filter, 
                ...{ storeId: store.id } 
            };

            cookies = await browser.cookies.getAll(query);

            res(header.concat(cookies.map(formatCookie)).join(""));
        } catch (e) {
            /* Returning a promise when no function is specified has not been implemented:
             * https://developer.chrome.com/docs/extensions/reference/cookies/#method-getAll */
            cookies = await browser.cookies.getAll(
                { ...stores.filter, ...{ storeId: store.id } },
                (cookies) => res(header.concat(cookies.map(formatCookie)).join(""))
            );
        }
    }

    return cookies;
})
// filter would include something like {url: "https://example.com"}