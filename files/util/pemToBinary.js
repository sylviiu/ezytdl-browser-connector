const pemToBinary = (pem) => {
    const pemContents = pem.split('\n').filter(line => !line.includes('-----')).join('').replace(/\s/g, '');

    const binaryDerString = atob(pemContents);

    const binaryDer = new Uint8Array(binaryDerString.length);

    for(let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return binaryDer;
}