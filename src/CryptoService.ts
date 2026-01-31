// Lógica de derivação de chave baseada no nome da sala
export async function deriveKey(channelName: string) {
    const encoder = new TextEncoder();
    const salt = encoder.encode("underland-static-salt-2026");
    const baseKey = await window.crypto.subtle.importKey(
        "raw", encoder.encode(channelName), "PBKDF2", false, ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        baseKey,
        { name: "AES-256-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptData(text: string, key: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-256-GCM", iv }, key, encoded);
    return { ciphertext: Array.from(new Uint8Array(ciphertext)), iv: Array.from(iv) };
}

export async function decryptData(payload: {ciphertext: number[], iv: number[]}, key: CryptoKey) {
    const { ciphertext, iv } = payload;
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-256-GCM", iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext)
    );
    return new TextDecoder().decode(decrypted);
}