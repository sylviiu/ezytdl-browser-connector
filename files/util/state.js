const stateObj = {
    state: {
        status: `disconnected`,
    },
    hooks: [],
};

const stateHooks = [];

const setState = async (newState={}) => {
    const currentStateString = JSON.stringify(stateObj.state);

    console.log(`setState`, newState)

    if(newState.status == `disconnected`) await new Promise(async res => {
        console.log(`status is "disconnected," checking for fingerprints`);

        chrome.storage.local.get(`fingerprint`, ({fingerprint}) => {
            try {
                fingerprint = JSON.parse(fingerprint);
                console.log(`fingerprint:`, fingerprint);
                Object.assign(newState, { status: `autoconnect` })
            } catch(e) {
                console.log(`not autoconnect: ${e}`)
            }

            res();
        });
    })

    console.log(`setState [after]`, newState)

    if(currentStateString == JSON.stringify(stateObj.state)) {
        stateObj.state = newState;
    
        for(const hook of stateHooks) hook(stateObj.state);
        chrome.runtime.sendMessage({ type: `state`, data: stateObj.state });
    }
};

setState({ status: `disconnected` });