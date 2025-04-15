---
title: Implementing Client-Side Encryption with Web Crypto API
description: How to secure sensitive data on the client side using the Web Crypto API for public key encryption
pubDate: '2025-04-14'
author: Raphael Berube
---

# Implementing Client-Side Encryption with Web Crypto API

## Introduction

Client-side encryption is a crucial security layer for web applications that handle sensitive information. This technical note explains how we implemented RSA-OAEP encryption using the Web Crypto API to secure data before it reaches our servers.

## Why Client-Side Encryption?

Even with HTTPS, data can still be vulnerable once it reaches our servers. By adding client-side encryption:

1. **End-to-End Encryption** - Data is encrypted directly on the user's device before transmission
2. **Reduced Server-Side Exposure** - Servers never see unencrypted sensitive data
3. **Defense in Depth** - Additional protection layer beyond TLS/SSL
4. **Compliance** - Helps with regulatory requirements for protecting PII

## Implementation Overview

Our implementation uses the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), which provides cryptographic primitives directly in the browser. Specifically, we're using RSA-OAEP with SHA-256 hash function for asymmetric encryption.

### Key Components

- **CryptoService Class** - Core functionality for encryption operations
- **encryptWithPublicKey** - Main function for encrypting text data
- **Public Key Management** - Handling PEM-formatted public keys

## Code Implementation

```typescript
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
  static async encryptWithPublicKey(text: string, publicKeyPem: string): Promise<string> {
    try {
      // Input validation
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
      }
      
      if (!publicKeyPem || typeof publicKeyPem !== 'string') {
        throw new Error('Invalid input: publicKeyPem must be a non-empty string');
      }
      
      // Process PEM key format
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
        ['encrypt'] // only for encryption
      );
      
      // Convert text to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        importedKey,
        data
      );
      
      // Convert the encrypted data to base64
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const byteToBase64 = btoa(
        String.fromCharCode.apply(null, Array.from(encryptedArray))
      );
      
      return byteToBase64;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  
  /**
   * Creates a wrapper that ensures the Web Crypto API is available
   */
  static ensureCryptoSupport<T extends (...args: any[]) => Promise<any>>(cryptoFn: T): T {
    return (async (...args: any[]) => {
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API is not supported in this environment');
      }
      
      return cryptoFn(...args);
    }) as T;
  }
}

// Export wrapper function
export const encryptWithPublicKey = CryptoService.ensureCryptoSupport(
  CryptoService.encryptWithPublicKey
);
```

## Usage Examples

### Basic Usage

Here's a simple example of encrypting text data:

```typescript
import { encryptWithPublicKey } from '../services/CryptoService';

async function secureData() {
  const serverPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`;

  const sensitiveText = "This is confidential information";
  
  try {
    const encryptedData = await encryptWithPublicKey(sensitiveText, serverPublicKey);
    console.log("Encrypted data:", encryptedData);
    return encryptedData;
  } catch (error) {
    console.error("Encryption failed:", error);
  }
}
```

### Advanced Usage with JSON Data

For more complex data structures:

```typescript
import { encryptWithPublicKey } from '../services/CryptoService';

interface UserData {
  username: string;
  password?: string;
  personalInfo?: {
    [key: string]: string;
  };
}

class SecureDataTransmission {
  constructor(private serverPublicKey: string) {}

  async prepareSecureData(userData: UserData) {
    try {
      // Convert the data object to a JSON string
      const dataString = JSON.stringify(userData);
      
      // Encrypt the JSON string using the server's public key
      const encryptedData = await encryptWithPublicKey(dataString, this.serverPublicKey);
      
      // Return a payload ready to be sent to the server
      return {
        encryptedData,
        timestamp: new Date().toISOString(),
        metadata: {
          encryption: 'RSA-OAEP',
          hash: 'SHA-256',
          encoding: 'base64'
        }
      };
    } catch (error: any) {
      console.error('Failed to prepare secure data:', error);
      throw new Error(`Data encryption failed: ${error.message}`);
    }
  }

  async sendSecureData(userData: UserData) {
    // First, encrypt the user data
    const securePayload = await this.prepareSecureData(userData);
    
    // Then send it to the server
    const response = await fetch('https://api.example.com/secure-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(securePayload)
    });
    
    return await response.json();
  }
}
```

## Key Limitations and Considerations

### RSA Encryption Size Limits

RSA can only encrypt data smaller than the key size minus padding. For a 2048-bit key:

- Maximum data size ≈ (2048/8) - padding bytes ≈ 245 bytes

For larger data, consider:
1. Using hybrid encryption (encrypt a symmetric key with RSA, then use that key to encrypt data)
2. Splitting data into chunks
3. Using a symmetric encryption approach instead

### Browser Compatibility

The Web Crypto API is widely supported in modern browsers:

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 37+            |
| Firefox | 34+            |
| Safari  | 11+            |
| Edge    | 12+            |

Always include feature detection before using crypto operations:

```typescript
if (window.crypto && window.crypto.subtle) {
  // Safe to use Web Crypto API
} else {
  // Fallback or error handling
}
```

### Security Best Practices

1. **Private Key Security** - Never expose private keys in client-side code
2. **Key Rotation** - Implement regular key rotation schedules
3. **Multiple Key Pairs** - Use different key pairs for different data types
4. **Error Handling** - Be careful not to leak sensitive information in error messages
5. **Always Use HTTPS** - Even with client-side encryption, HTTPS is still necessary

## Testing

The encryption functionality is thoroughly tested using Vitest. Our tests cover:

- Basic encryption functionality
- Input validation
- Error handling
- PEM key format handling
- Environment compatibility checks

To run the tests:

```bash
pnpm test
```

