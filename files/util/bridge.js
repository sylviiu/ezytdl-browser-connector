const handle = ({ type, data }) => {
    if(type == `verifyConnect`) {
        return verifyConnect(data);
    } else if(type == `connect`) {
        return connect(true);
    } else if(type == `kill`) {
        return kill();
    } else if(type == `purge`) {
        return purge();
    } else if(type == `send`) {
        return send(...data);
    } else if(type == `vars`) {
        return {vars, comms}
    } else if(type == `state`) {
        return stateObj.state;
    }
}

chrome.runtime.onMessage.addListener(async (o, sender, res) => {
    const single = !Array.isArray(o);

    if(single) o = [o];

    const promises = [];

    const retObj = [];

    for(const i in o) {
        const obj = o[i]

        const response = handle(obj);

        const add = () => retObj[i] = response;

        if(response && response.then) {
            promises.push(response.then(add));
        } else {
            add();
        };
    }

    if(promises.length) await Promise.all(promises);

    return res(single ? retObj[0] : retObj);
})

chrome.action.onClicked.addListener(async (tab) => {
    console.log(`clicked!`, tab);
    connect(true);
})