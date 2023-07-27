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
        case `vars`:
            return {vars, comms}
        case `state`:
            return stateObj.state;
        default:
            return null;
    }
}

chrome.runtime.onMessage.addListener(async o => {
    console.log(`received message!`, o);

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

    chrome.runtime.sendMessage({ type: `refreshVars`, data: retObj });
})

chrome.action.onClicked.addListener(async (tab) => {
    console.log(`clicked!`, tab);
    connect(true);
})