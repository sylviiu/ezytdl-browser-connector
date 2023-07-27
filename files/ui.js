console.log(`ui loaded!`);

const sendRequest = async ({
    cookies=true
}={}) => {
    browser.tabs.query({ active: true, currentWindow: true }).then(async tabs => {
        const tab = tabs[0];

        if(tab) {
            const url = tab.url;

            if(url) {
                const obj = {
                    query: url,
                    cookies: cookies ? (await parseCookies({ url })) : null
                }

                console.log(obj)

                chrome.runtime.sendMessage({
                    type: `send`,
                    data: {
                        type: `listFormats`,
                        data: [ obj ]
                    }
                });
            }
        }
    });
}

const vars = {};

const types = [{ type: `vars` }, { type: `state` }];

const refreshVars = async () => chrome.runtime.sendMessage(types);

let refreshState = () => {}

const run = async () => {
    const containers = {
        content: document.getElementById(`contentDiv`),
        inputs: document.getElementById(`inputs`),
        buttons: document.getElementById(`buttons`),
    };

    containers.inputs.classList.add(`d-none`)

    containers.content.style.height = `100%`
    containers.content.classList.add(`d-flex`);
    containers.content.classList.add(`flex-column`);
    containers.content.classList.add(`justify-content-between`);

    containers.buttons.classList.remove(`d-flex`)

    document.body.classList.remove(`justify-content-center`);
    document.body.classList.add(`justify-content-between`);

    const button = document.getElementById(`button`).cloneNode(true);

    document.getElementById(`button`).parentElement.removeChild(document.getElementById(`button`));
    
    const title = document.getElementById(`title`);
    const description = document.getElementById(`content`);

    const footer = description.cloneNode(true);
    footer.id = `footer`;
    footer.innerHTML = ``

    containers.content.appendChild(footer);

    const states = {
        reset: () => new Promise(async res => {
            title.innerHTML = `ezytdl browser connector`

            const footerStrings = [];

            if(vars.vars && vars.vars.manifestData && vars.vars.manifestData.version) footerStrings.push(`v${vars.vars.manifestData.version}`);

            footer.innerHTML = footerStrings.join(`, `);

            containers.buttons.innerHTML = ``;

            document.body.style.width = `350px`;
            document.body.style.height = `500px`;

            res();
        }),
        disconnected: () => {
            title.innerHTML = `Disconnected`;

            description.innerHTML = `It looks like you haven't connected to the application yet!<br><br>To connect to ezytdl, make sure the browser connector is enabled in the settings, and click the button below.`;

            const pairBtn = button.cloneNode(true);

            pairBtn.querySelector(`#txt`).innerHTML = `Pair with ezytdl`;
            pairBtn.onclick = () => chrome.runtime.sendMessage({ type: `connect`, data: [ true ] });

            containers.buttons.append(pairBtn);
        },
        autoconnect: () => {
            title.innerHTML = `Disconnected`;

            description.innerHTML = `You've already paired with the application!<br><br>To connect to ezytdl, make sure the browser connector is enabled in the settings, and click the button below.`;

            const reconnect = button.cloneNode(true);

            reconnect.querySelector(`#txt`).innerHTML = `Reconnect`;
            reconnect.onclick = () => chrome.runtime.sendMessage({ type: `connect`, data: [ true ] });

            containers.buttons.append(reconnect);

            const remove = button.cloneNode(true);

            remove.querySelector(`#txt`).innerHTML = `Remove pairing`;
            remove.onclick = () => chrome.runtime.sendMessage({ type: `purge` });

            containers.buttons.append(remove);
        },
        connecting: () => {
            title.innerHTML = `Connecting...`;

            description.innerHTML = `Attempting connection to the application...`;
        },
        handshaking: () => {
            title.innerHTML = `Connecting...`;

            description.innerHTML = `Performing handshake...`;
        },
        verifyConnect: () => {
            title.innerHTML = `Trust this app?`;

            const { name, version, fingerprint } = vars.state.session;

            description.innerHTML = `This app has not been previously trusted. If you trust this app, click the button below to continue.<br><br><strong>Fingerprint: ${fingerprint}</strong><br>App name: ${name}<br>App version: ${version}`;

            const confirm = button.cloneNode(true);

            confirm.querySelector(`#txt`).innerHTML = `Confirm`;
            confirm.onclick = () => chrome.runtime.sendMessage({ type: `verifyConnect`, data: [ fingerprint ] });

            containers.buttons.append(confirm);

            const cancel = button.cloneNode(true);

            cancel.querySelector(`#txt`).innerHTML = `Cancel`;
            cancel.onclick = () => chrome.runtime.sendMessage({ type: `kill`, data: [ fingerprint ] });

            containers.buttons.append(cancel);
        },
        encrypting: () => {
            title.innerHTML = `Encrypting...`;

            description.innerHTML = `Setting up encryption with the application...`;
        },
        ready: () => {
            console.log(vars)

            const { name, version, fingerprint } = vars.state.session;

            title.innerHTML = `Connected!`;

            description.innerHTML = `Connected to ${name} v${version}`;

            const smallerDescription = description.cloneNode(true);
            smallerDescription.style.marginTop = `16px`;
            smallerDescription.innerHTML = `Fingerprint: ${fingerprint}`;
            smallerDescription.style.fontSize = `0.6em`;

            description.innerHTML += smallerDescription.outerHTML;

            const authSend = button.cloneNode(true);

            authSend.querySelector(`#txt`).innerHTML = `Send webpage (with auth)`;
            authSend.setAttribute(`title`, `Send the current webpage to ezytdl, with authentication.`)
            authSend.onclick = () => sendRequest();

            containers.buttons.append(authSend);

            const sendPage = button.cloneNode(true);

            sendPage.querySelector(`#txt`).innerHTML = `Send webpage`;
            sendPage.setAttribute(`title`, `Send the current webpage to ezytdl, without authentication.`)
            sendPage.onclick = () => sendRequest({ cookies: false });

            containers.buttons.append(sendPage);

            const cancel = button.cloneNode(true);

            cancel.querySelector(`#txt`).innerHTML = `Disconnect`;
            cancel.onclick = () => chrome.runtime.sendMessage({ type: `kill` });

            containers.buttons.append(cancel);
        },
    };

    let previousState = vars.state ? vars.state.status : null;

    let statePromise = null;

    states.reset().then(async () => {
        refreshState = async () => {
            if(statePromise) {
                await statePromise;
            }

            if(vars.state.status != previousState) {
                console.log(`current state:`, vars.state.status);
                statePromise = states.reset();
                await statePromise;
            }
        
            if(vars.state.status != `reset` && states[vars.state.status]) {
                const f = states[vars.state.status]();
                if(f && f.then) statePromise = f;
            }
        };

        while(!vars.state || !vars.state.status) await new Promise(async res => {
            await refreshVars();

            if(vars.state && vars.state.status) {
                await refreshState();
                res();
            } else {
                setTimeout(res, 100);
            }
        })
    })
};

chrome.runtime.onMessage.addListener(({ type, data }) => {
    if(type == `refreshVars`) {
        for(const i in data) {
            Object.assign(vars, { [types[i].type]: data[i] });
        }
    
        console.log(`refreshed vars`, vars)
    } else {
        vars[type] = data;
    }
    refreshState();
});

if(!document.body) {
    document.addEventListener(`DOMContentLoaded`, run);
} else {
    run();
}