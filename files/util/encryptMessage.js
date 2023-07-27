const encryptMessage = (data, serverKey) => new Promise(async res => {
    if(typeof data == `object`) data = JSON.stringify(data);

    data = `${data}`;

    const buffer = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, serverKey, buffer);

    return res(encrypted);
});