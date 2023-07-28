// FULL CREDITS GO TO https://github.com/hrdl-github/cookies-txt

const cookieFileHeader = [
    "# Netscape HTTP Cookie File\n",
    "# https://curl.haxx.se/rfc/cookie_spec.html\n",
    "# This is a generated file! Do not edit.\n\n",
];

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

const getCookies = (url) => new Promise(async res => {
    const parsedURL = new URL(url);

    console.log(`parsedURL`, parsedURL)
    
    const filter = (o, secure) => o.filter(o2 => secure ? o2.secure : !o2.secure).map(o2 => `${o2.name}=${o2.value}`)

    const cookiesObjRaw = await browser.cookies.getAll({ domain: parsedURL.hostname.split(`.`).slice(-2).join(`.`) });
    const cookiesObjFiltered = filter(cookiesObjRaw, parsedURL.protocol == `https:`);
    
    return res({
        cookiesObj: cookiesObjFiltered,
        cookiesHeader: cookiesObjFiltered.join(`; `),
        cookiesTxt: cookieFileHeader.concat(cookiesObjRaw.map(formatCookie)).join("")
    });
});