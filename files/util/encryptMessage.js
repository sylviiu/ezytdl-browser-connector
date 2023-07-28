const encryptMessage = (data, serverKey) => new Promise(async res => {
    if(typeof data == `object`) {
        data = JSON.stringify(data);
    } else {
        data = `${data}`;
    }

    // create a random AES key
    const aesKey = crypto.getRandomValues(new Uint8Array(32));
    const useKey = await crypto.subtle.importKey('raw', aesKey, 'AES-CBC', true, ['encrypt', 'decrypt']);

    // encrypt that key using the server's public key
    const encryptedKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, serverKey, aesKey);

    // create IV
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // encrypt using that key
    const buffer = new TextEncoder().encode(data);
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CBC', length: 256, iv }, useKey, buffer);

    const resObj = {
        key: Array.from(new Uint8Array(encryptedKey)),
        data: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(new Uint8Array(iv)),
    };
    
    console.log(`encrypted message!`, resObj);

    return res(JSON.stringify(resObj));
});