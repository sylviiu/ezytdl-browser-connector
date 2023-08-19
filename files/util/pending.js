const pendingMessages = [];

const addPending = (data) => {
    pendingMessages.push(data);
    console.log(`socket not ready! (placed in pending)`, data);
}

const sendPending = () => new Promise(async res => {
    while(pendingMessages.length > 0) {
        await send(pendingMessages.shift());
    };

    res();
})