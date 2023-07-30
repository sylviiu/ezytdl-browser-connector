const handle = ({ type, data }) => {
    switch(type) {
        case `verifyConnect`:
            return verifyConnect(data);
        case `connect`:
            return connect(true);
        case `kill`:
            return kill();
        case `purge`:
            return purge();
        case `send`:
            return send(data);
        case `sendRequest`:
            return sendRequest(data);
        case `vars`:
            return {vars, comms}
        case `state`:
            return stateObj.state;
        default:
            return null;
    }
}

const types = [{ type: `vars` }, { type: `state` }];

const bridgeHandler = async (o, sender, res) => {
    console.log(`received message!`, o);

    if(o.type == `refreshVars`) return bridgeHandler(types, sender, res);

    const single = !Array.isArray(o);

    if(single) o = [o];

    const promises = [];

    const retObj = [];

    for(const i in o) {
        const obj = o[i]

        const response = handle(obj);

        const add = (val) => retObj[i] = val;

        if(response && response.then) {
            promises.push(response.then(add));
        } else {
            add(response);
        };
    }

    if(promises.length) await Promise.all(promises);

    if(single) {
        chrome.runtime.sendMessage({ type: o.type, data: retObj[0] });
        return res(retObj[0]);
    } else {
        chrome.runtime.sendMessage({ type: `refreshVars`, types, data: retObj });
        return res(retObj);
    }
}

chrome.runtime.onMessage.addListener(bridgeHandler)

chrome.action.onClicked.addListener(async (tab) => {
    console.log(`clicked!`, tab);
    connect(true);
})