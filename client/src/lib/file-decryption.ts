type DecryptFileParam = {
  encryptedFile: Uint8Array;
  encryptedFileEncryptionKey: string;
  decryptedFileMimeType: string;
  encryptedPrivateKey: string;
  masterPassword: string;
};

export class FileDecryption {
  constructor() {}

  async decryptFile({
    decryptedFileMimeType,
    encryptedFile,
    encryptedPrivateKey,
    encryptedFileEncryptionKey,
    masterPassword,
  }: DecryptFileParam) {
    const privateKey = await this.decryptPrivateKey(encryptedPrivateKey, masterPassword);
    const encryptionKey = await this.decryptFileEncryptionKey(privateKey, encryptedFileEncryptionKey);
    const decryptedBuffer = await this.getDecryptedBuffer(encryptedFile, encryptionKey);

    const decryptedFile = new Blob([decryptedBuffer], { type: decryptedFileMimeType });

    return decryptedFile;
  }

  /** Derive key from master password which is used to decrypt the private key */
  private async deriveKeyFromMasterPassword(masterPassword: Uint8Array, salt: Uint8Array) {
    const baseKey = await crypto.subtle.importKey("raw", masterPassword, { name: "PBKDF2" }, false, ["deriveKey"]);

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );

    return derivedKey;
  }

  /** Decrypt the encrypted private key using master password */
  private async decryptPrivateKey(encryptedPrivateKey: string, masterPassword: string) {
    const masterPasswordBuffer = new TextEncoder().encode(masterPassword);
    const pkeyBuffer = Uint8Array.from(atob(encryptedPrivateKey), (char) => char.charCodeAt(0));

    const salt = pkeyBuffer.slice(0, 16);
    const iv = pkeyBuffer.slice(16, 28);
    const cipherText = pkeyBuffer.slice(28);

    const derivedKey = await this.deriveKeyFromMasterPassword(masterPasswordBuffer, salt);
    const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, derivedKey, cipherText);

    return new TextDecoder().decode(decryptedBuffer);
  }

  /** import the decrypted private key */
  private async importPrivateKey(decryptedPrivateKey: string) {
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = decryptedPrivateKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, ""); // Remove whitespace

    const binaryDer = Uint8Array.from(atob(pemContents), (char) => char.charCodeAt(0));

    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );

    return importedKey;
  }

  /** Decrypt the file encryption key which was encrypted using the recipient public key */
  private async decryptFileEncryptionKey(decryptedPrivateKey: string, encryptedFileEncryptionKey: string) {
    const privateKey = await this.importPrivateKey(decryptedPrivateKey);
    const fileEncBuffer = Uint8Array.from(atob(encryptedFileEncryptionKey), (char) => char.charCodeAt(0));

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      fileEncBuffer
    );

    const decoded = new TextDecoder().decode(decryptedData);

    return JSON.parse(decoded) as JsonWebKey;
  }

  /** Get the decrypted file buffer by using the decrypted file encryption key */
  private async getDecryptedBuffer(encryptedFile: Uint8Array, encryptionKey: JsonWebKey) {
    const iv = new Uint8Array(encryptedFile.slice(0, 12));
    const encryptedContent = encryptedFile.slice(12);

    const symmetricKey = await crypto.subtle.importKey(
      "jwk",
      encryptionKey,
      {
        name: "AES-GCM",
      },
      true,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      symmetricKey,
      encryptedContent
    );

    return decryptedBuffer;
  }
}
