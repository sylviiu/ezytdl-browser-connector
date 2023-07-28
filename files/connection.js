const scripts = [];

if(typeof importScripts == `function`) {
    importScripts(...scripts.map(s => `./${s}`));
    
    console.log(`loaded ${scripts.length} scripts! (${scripts.map(s => s.split(`/`).slice(-1)[0]).join(`, `)})`)
}

setState({ status: `disconnected` });

let usingSocket = null;

let running = false;

let manual = false;

const kill = () => {
    console.log(`killing socket!`);
    if(usingSocket) {
        usingSocket.close();
        console.log(`killed socket!`);
        return true;
    } else {
        console.log(`no socket to kill!`);
        return false;
    }
};

const purge = () => {
    chrome.storage.local.remove(`fingerprint`);
    setState({ status: `disconnected` });
}

let verifyConnect = () => {};

const connect = (doManual=false) => {
    if(running) {
        if(doManual) manual = true;
        return running;
    };

    const promise = new Promise(async res => {    
        manual = doManual;
        
        setState({ status: `connecting` })

        const existingAuth = await new Promise(async res => {
            chrome.storage.local.get(`fingerprint`, ({fingerprint}) => {
                if(fingerprint) {
                    try {
                        res(JSON.parse(fingerprint));
                    } catch(e) {
                        res({})
                    }
                } else {
                    res({});
                }
            })
        })
    
        const session = {};
    
        const socket = new WebSocket(`ws://localhost:38529`);

        usingSocket = socket;
    
        const startHandler = async () => {
            startEncryptedComms({ session, socket, key: pemToBinary(existingAuth.publicKey) }).then(manager => {
                socket.addEventListener(`close`, () => {
                    console.log(`socket closed! (at manager)`);
                    manager.destroy();
                });
    
                if(socket.readyState != socket.OPEN) {
                    console.log(`socket not open! (current: ${vars.socketStates[socket.readyState]})`);

                    try {
                        socket.close();
                    } catch(e) {}

                    return res(manager.destroy());
                } else {
                    setState({ status: `connected` });
                    console.log(`socket open! (current: ${vars.socketStates[socket.readyState]})`);
                }
            });
        }
    
        let initialMsgs = 0;
    
        socket.onmessage = event => {
            try {
                initialMsgs++;
    
                const { type, data } = JSON.parse(event.data);
    
                console.log(`initial type: ${type} (#${initialMsgs})`)
    
                if(type == `hello`) {
                    console.log(`received hello!`, data);

                    setState({ status: `handshaking` });
    
                    Object.assign(session, data);
    
                    socket.send(JSON.stringify({type: `hello`, data: comms.hello}))
                } else if(type == `handshake`) {
                    console.log(`received handshake data!`, data);
    
                    Object.assign(session, data);
    
                    if(existingAuth.fingerprint != data.fingerprint) {
                        console.log(`fingerprint mismatch! (current: ${existingAuth.fingerprint} / new: ${data.fingerprint})`);
    
                        if(manual) {
                            socket.send(JSON.stringify({ type: `pair` }));

                            verifyConnect = (fingerprint) => {
                                if(fingerprint == data.fingerprint) {
                                    console.log(`fingerprint match! requesting pubkey`);

                                    setState({ status: `encrypting` });

                                    socket.onmessage = event => {
                                        try {
                                            const o = JSON.parse(event.data);

                                            if(o.type == `key`) {
                                                Object.assign(existingAuth, {
                                                    fingerprint: session.fingerprint,
                                                    publicKey: o.data
                                                });

                                                console.log(`received pubkey, auth object complete!:`, existingAuth);
                            
                                                chrome.storage.local.set({ fingerprint: JSON.stringify(existingAuth) });

                                                startHandler();
                                            } else console.log(`received data (not what was expected):`, o);
                                        } catch(e) {
                                            console.log(`received data:`, event.data);
                                            console.error(`failed at data decryption process: ${e.message}`)
                                        }
                                    }

                                    socket.send(JSON.stringify({ type: `key` }));
                                } else {
                                    console.error(`fingerprint mismatch! (verifyConnect): got ${fingerprint} (expected ${data.fingerprint})`);
                                }
                            }

                            setState({ status: `verifyConnect`, session });
                        } else {
                            socket.close();
                            return;
                        }
                    } else {
                        console.log(`fingerprint match!`);
                        startHandler();
                    }
                } else if(type == `ready`) {
                    console.log(`received ready!`);
                    setState({ status: `ready`, session });
                }
            } catch(e) {
                console.log(`received data:`, event.data);
                console.error(`failed at data decryption process: ${e.message}`)
            }
        }
    
        socket.onopen = async () => {
            console.log(`socket opened!`);
            setState({ status: `handshaking` });
        };
    
        socket.addEventListener(`close`, () => {
            console.log(`socket closed!`);
            setState({ status: `disconnected` });
            if(usingSocket == socket) usingSocket = null;
            res();
        });
    
        socket.addEventListener(`error`, e => {
            console.log(`socket error!`, e);
            res();
        });
    });

    running = promise;

    promise.then(() => {
        setState({ status: `disconnected` })
        if(promise == running) running = false;
        console.log(`socket promise completed!`);
    })

    return promise;
};

connect(false);