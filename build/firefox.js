const fs = require(`fs`);

module.exports = ({ utilScripts }) => ({
    browser_specific_settings: {
        gecko: {
            id: "ezytdl@sylviiu.dev"
        }
    },
    background: {
        scripts: utilScripts.concat([`connection.js`]),
        //persistent: true
    }
})