const pendingMessages = [];

const addPending = (data) => {
    pendingMessages.push(data);
    console.log(`[extension] socket not ready! (placed in pending)`, data);
}

let send;

const resetSend = () => {
    send = (data) => {
        console.log(`[extension] socket not ready! (reset)`, data);
        Promise.resolve(addPending(data));
    }
}

resetSend();

const startEncryptedComms = async ({ socket, hooks, key }) => {
    socket.onclose = () => {
        resetSend();
        socket = null;

        hooks.onclose();
    }

    const serverKey = await crypto.subtle.importKey('spki', key, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);

    if(socket) {
        send = (data) => new Promise(async res => {
            const encrypted = await encryptMessage(data, serverKey);
    
            if(socket) {
                socket.send(encrypted);
                console.log(`[extension] sent (encrypted) data!`);
                res();
            } else {
                addPending(data)
                res();
            }
        });
    
        send(`hello`);
    
        while(pendingMessages.length > 0) await send(pendingMessages.shift());
    }
}

(async () => {
    while(true) await new Promise(async resolve => {
        const res = () => {
            console.log(`[extension] socket resolved! (5s timeout)`);
            setTimeout(() => resolve(), 5000);
        };
    
        const socket = new WebSocket(`ws://localhost:38529`);

        const hooks = {
            onclose: async () => {
                console.log(`[extension] socket closed!`);
                res();
            },
            onerror: async e => {
                console.log(`[extension] socket error!`, e);
                res();
            }
        }
    
        socket.onopen = async () => {
            console.log(`[extension] socket opened!`);

            socket.onmessage = event => {
                try {
                    const o = JSON.parse(event.data);
                    if(o.key) {
                        console.log(`[extension] received key!`, o.key);
                        startEncryptedComms({ socket, hooks, key: pemToBinary(o.key) });
                    }
                } catch(e) {
                    console.log(`[extension] received data:`, event.data);
                    console.error(`[extension] failed at data decryption process: ${e.message}`)
                }
            }
        };
        
        for(const [key, value] of Object.entries(hooks)) {
            console.log(`[extension] setting hook ${key}...`);
            socket[key] = value;
        }
    })
})();