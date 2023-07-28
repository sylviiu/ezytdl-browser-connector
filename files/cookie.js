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

    let cookiesObj = {};

    console.log("Stores: ", stores.length);
    console.log("Filter: ", filter);

    for (var store of stores) {
        console.log("Store: " + store.id);
        try {
            query = Object.assign({ storeId: store.id }, filter);

            if(browser.runtime.getBrowserInfo().version >= "59.0") Object.assign(query, { firstPartyDomain: null });

            cookiesObj = await browser.cookies.getAll(query);
        } catch (e) {
            cookiesObj = await browser.cookies.getAll( Object.assign({ storeId: store.id }, filter), (cookies) => res(header.concat(cookies.map(formatCookie)).join("")) );
        }
    };

    console.log(cookiesObj)

    return res({
        cookiesObj,
        cookiesTxt: header.concat(cookiesObj.map(formatCookie)).join("")
    });
})
// filter would include something like {url: "https://example.com"}