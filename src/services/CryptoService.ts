/**
 * A service for performing cryptographic operations using the Web Crypto API
 */
export class CryptoService {
  /**
   * Encrypts text data using RSA-OAEP and a public key
   *
   * @param {string} text - The plain text to encrypt
   * @param {string} publicKeyPem - The PEM-encoded public key
   * @returns {Promise<string>} A base64-encoded encrypted data string
   */
  static async encryptWithPublicKey(
    text: string,
    publicKeyPem: string,
  ): Promise<string> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
      }

      if (!publicKeyPem || typeof publicKeyPem !== 'string') {
        throw new Error(
          'Invalid input: publicKeyPem must be a non-empty string',
        );
      }

      // Remove header/footer and convert base64 PEM to binary
      const pemHeader = '-----BEGIN PUBLIC KEY-----';
      const pemFooter = '-----END PUBLIC KEY-----';

      let pemContents = publicKeyPem;
      if (pemContents.includes(pemHeader) && pemContents.includes(pemFooter)) {
        pemContents = pemContents
          .replace(pemHeader, '')
          .replace(pemFooter, '')
          .replace(/\s/g, '');
      }

      // Decode the PEM content
      const binaryDerString = atob(pemContents);
      const binaryDer = new Uint8Array(binaryDerString.length);

      for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
      }

      // Import the public key
      const importedKey = await window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false, // not extractable
        ['encrypt'], // only for encryption
      );

      // Convert text to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        importedKey,
        data,
      );

      // Convert the encrypted data to base64
      const encryptedArray = new Uint8Array(encryptedBuffer);
      let base64String = '';

      // Manual base64 conversion for better browser compatibility
      const byteToBase64 = btoa(
        String.fromCharCode.apply(null, Array.from(encryptedArray)),
      );

      return byteToBase64;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Creates a wrapper that ensures the Web Crypto API is available
   *
   * @param {Function} cryptoFn - The crypto function to wrap
   * @returns {Function} A function that checks for crypto support before execution
   */
  static ensureCryptoSupport<T extends (...args: any[]) => Promise<any>>(
    cryptoFn: T,
  ): T {
    return (async (...args: any[]) => {
      if (
        typeof window === 'undefined' ||
        !window.crypto ||
        !window.crypto.subtle
      ) {
        throw new Error('Web Crypto API is not supported in this environment');
      }

      return cryptoFn(...args);
    }) as T;
  }
}

// Create wrapped versions of our crypto functions
export const encryptWithPublicKey = CryptoService.ensureCryptoSupport(
  CryptoService.encryptWithPublicKey,
);

// Export a default object with all methods
export default {
  encryptWithPublicKey,
};
