const pendingMessages = [];

const addPending = (data) => {
    pendingMessages.push(data);
    console.log(`socket not ready! (placed in pending)`, data);
}

const sendPending = () => new Promise(async res => {
})