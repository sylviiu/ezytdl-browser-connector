const fs = require(`fs`);

module.exports = {
    "browser_specific_settings": {
        "gecko": {
            "id": "ezytdl@sylviiu.dev"
        }
    },
    "background": {
        "scripts": [...fs.readdirSync(`./files/util`).map(s => `util/${s}`), "connection.js"]
    }
}