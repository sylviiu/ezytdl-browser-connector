const fs = require(`fs`);

module.exports = ({ targetDir, utilScripts }) => {
    let connection = fs.readFileSync(`${targetDir}/connection.js`, `utf8`).split(`\n`);

    connection[0] = `const scripts = [${utilScripts.map(s => `"${s}"`).join(`, `)}];`;

    fs.writeFileSync(`${targetDir}/connection.js`, connection.join(`\n`));

    return {
        background: {
            service_worker: "connection.js"
        }
    }
}