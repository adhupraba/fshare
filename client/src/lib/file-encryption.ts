export class FileEncryption {
  static async encrypt(file: File) {
    const symmetricKey = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    const exportedKey = await crypto.subtle.exportKey("jwk", symmetricKey);
    const fileBuffer = await file.arrayBuffer();

    // Generate a random 12 byte initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      symmetricKey,
      fileBuffer
    );

    // Combine IV and encrypted data for upload
    const encryptedFileWithIV = new Blob([iv, new Uint8Array(encryptedBuffer)], { type: "application/octet-stream" });

    return {
      encryptionKey: exportedKey,
      encryptedFile: encryptedFileWithIV,
    };
  }
}
