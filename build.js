const fs = require('fs');
const child_process = require('child_process');
const https = require('https');
const path = require('path');

const filesDir = path.join(__dirname, `files`);
const htmlDir = path.join(__dirname, `files`, `html`);
const distDir = path.join(__dirname, `dist`);
const buildDir = path.join(__dirname, `build`);

const package = require(`./package.json`);
const sources = require(`./sources.json`);

const manifest = Object.assign({
    name: package.name,
    description: package.description,
    version: package.version,
}, require(`./files/manifest.json`));

const request = (url) => new Promise(async res => {
    console.log(`Requesting ${url}...`)

    const headers = {};

    if(process.env["GITHUB_TOKEN"]) {
        console.log(`GITHUB_TOKEN found in environment! Authorizing this GitHub request`)
        headers["Authorization"] = `${process.env["GITHUB_TOKEN"]}`;
    }

    https.get(url, { headers }, (response) => {
        let data = ``;

        response.on(`data`, (chunk) => {
            data += chunk;
        });

        response.on(`end`, () => {
            console.log(`Received ${Buffer.byteLength(data)} bytes`);
            res(data);
        });
    });
});

const exec = (step, file, args) => new Promise(async res => {
    console.log(`[${step}] Spawning "${file}" with ${args.length} arg(s)`);

    const child = child_process.spawn(file, args, { cwd: filesDir });

    child.stdout.on(`data`, (data) => {
        const prefix = `[${step}/OUT]: `;
        console.log(prefix + data.toString().trim().split(`\n`).join(`\n` + prefix));
    });

    child.stderr.on(`data`, (data) => {
        const prefix = `[${step}/ERR]: `;
        console.log(prefix + data.toString().trim().split(`\n`).join(`\n` + prefix));
    });

    child.on(`error`, (error) => {
        console.log(`[${step}] error: ${error.message}`);
        res(null);
    });

    child.on(`close`, (code) => {
        console.log(`[${step}] child process exited with code ${code}`);
        res(code);
    });
});

const cleanup = () => {
    console.log(`Cleaning up.`);

    if(fs.existsSync(require(`path`).join(filesDir, `.git`))) fs.rmSync(require(`path`).join(filesDir, `.git`), { recursive: true, force: true });
    if(fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
}

(async () => {
    cleanup();

    try {
        if(!fs.existsSync(htmlDir) || !fs.existsSync(path.join(htmlDir, `index.html`))) {
            if(fs.existsSync(htmlDir)) fs.rmSync(htmlDir, { recursive: true, force: true });

            console.log(`Creating & initializing html dir...`)
            
            fs.mkdirSync(htmlDir);
            
            await exec(`init`, `git`, [`init`])
            
            await exec(`remote`, `git`, [`remote`, `add`, `--no-tags`, `-f`, `origin`, sources.ezytdl.url])
            
            console.log(`Enabling sparse checkout...`)
        
            await exec(`sparse`, `git`, [`config`, `core.sparseCheckout`, `true`])

            console.log(`Disabling tag fetch`);

            await exec(`tags`, `git`, [`config`, `remote.origin.tagopt`, `--no-tags`])
            
            for(const source of sources.ezytdl.checkout_paths) {
                console.log(`Adding "${source}" to sparse checkout...`)
                fs.appendFileSync(require(`path`).join(filesDir, `.git`, `info`, `sparse-checkout`), `${source}\n`);
            };
            
            console.log(`Pulling files...`);
            
            await exec(`pull`, `git`, [`pull`, `--depth`, `1`, `origin`, sources.ezytdl.branch]);
        
            console.log(`Removing git files...`);
        
            fs.rmSync(require(`path`).join(filesDir, `.git`), { recursive: true, force: true });
            
            console.log(`Downloading dialog.html as index.html...`);
        
            let html = await request(sources.ezytdl.dialog_html);

            const spacing = html.split(`</head`)[0].split(`\n`).filter(o => o.trim()).slice(-1)[0].split(`<`)[0]

            html = html.replace(`</head>`, spacing + `<script src="../ui.js"></script>\n</head>`)
        
            fs.writeFileSync(path.join(htmlDir, `index.html`), html);    
        } else console.log(`html dir already exists! Skipping initialization...`);

        console.log(`Creating "dist/" dir`);
    
        fs.mkdirSync(distDir);
    
        const manifestFiles = fs.readdirSync(buildDir).filter(f => f.endsWith(`.json`)).map(f => Object.assign({ name: f.split(`.`).slice(0, -1).join(`.`), manifestExt: require(`./build/${f}`) }));
    
        console.log(`Creating ${manifestFiles.length} output dirs... (${manifestFiles.map(o => o.name).join(`, `)})`);
    
        for(const { name, manifestExt } of manifestFiles) {
            const targetDir = path.join(distDir, name);
    
            if(fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });

            fs.cpSync(filesDir, targetDir, { recursive: true });
            
            fs.writeFileSync(path.join(targetDir, `manifest.json`), JSON.stringify(Object.assign({}, manifest, manifestExt), null, 4));

            console.log(`Created dir for ${name}...`);
        }
    } catch(e) {
        console.log(`Error: ${e.message}`);
        cleanup();
    }
})()