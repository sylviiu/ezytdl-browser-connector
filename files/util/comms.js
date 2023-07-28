let send = (data) => {
    console.log(`socket not ready! (reset)`, data);
    Promise.resolve(addPending(data));
}

const resetSend = () => {
    send = (data) => {
        console.log(`socket not ready! (reset)`, data);
        Promise.resolve(addPending(data));
    }
}

resetSend();

const startEncryptedComms = ({ session, socket, key }) => new Promise(async res => {
    const retObj = {
        destroy: () => {
            console.log(`[extension/${session.id}] RESETTING`);
            resetSend();
            socket = null;
        }
    };

    res(retObj);

    const serverKey = await crypto.subtle.importKey('spki', key, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);

    if(socket) {
        send = (data) => new Promise(async res => {
            const encrypted = await encryptMessage(data, serverKey);
    
            if(socket) {
                socket.send(encrypted);
                console.log(`[extension/${session.id}] sent (encrypted) data!`);
                res();
            } else {
                addPending(data)
                res();
            }
        });

        setState({ status: `ready`, session });
    
        send({ type: `ready` });
    
        await sendPending();
    }
})