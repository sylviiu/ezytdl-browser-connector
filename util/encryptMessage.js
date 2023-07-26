const encryptMessage = (data, serverKey) => new Promise(async res => {
    if(typeof data == `object`) data = JSON.stringify(data);

    data = `${data}`;

    const buffer = new TextEncoder().encode(data);

    console.log(`[extension] encrypting data:`, buffer, data, serverKey);

    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, serverKey, buffer);

    console.log(`[extension] encrypted data:`, encrypted);

    return res(encrypted);
});