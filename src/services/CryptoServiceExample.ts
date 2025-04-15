import { encryptWithPublicKey } from './CryptoService';

/**
 * Example demonstrating how to use the encryption service
 * in a real-world application for encrypting sensitive data
 * before sending it to a server.
 */

export interface UserData {
  username: string;
  password?: string;
  personalInfo?: {
    [key: string]: string;
  };
  paymentInfo?: {
    [key: string]: string;
  };
  [key: string]: any;
}

export interface SecurePayload {
  encryptedData: string;
  timestamp: string;
  metadata: {
    encryption: string;
    hash: string;
    encoding: string;
  };
}

export class SecureDataTransmission {
  private serverPublicKey: string;

  constructor(serverPublicKey: string) {
    this.serverPublicKey = serverPublicKey;
  }

  /**
   * Encrypts sensitive user data before transmission
   * @param {UserData} userData - Object containing sensitive user data
   * @returns {Promise<SecurePayload>} Encrypted data ready for transmission
   */
  async prepareSecureData(userData: UserData): Promise<SecurePayload> {
    try {
      // Convert the data object to a JSON string
      const dataString = JSON.stringify(userData);

      // Encrypt the JSON string using the server's public key
      const encryptedData = await encryptWithPublicKey(
        dataString,
        this.serverPublicKey,
      );

      // Return a payload ready to be sent to the server
      return {
        encryptedData,
        timestamp: new Date().toISOString(),
        metadata: {
          encryption: 'RSA-OAEP',
          hash: 'SHA-256',
          encoding: 'base64',
        },
      };
    } catch (error: any) {
      console.error('Failed to prepare secure data:', error);
      throw new Error(`Data encryption failed: ${error.message}`);
    }
  }

  /**
   * Example method to securely send sensitive user data to the server
   * @param {UserData} userData - User data to transmit securely
   * @returns {Promise<any>} Server response
   */
  async sendSecureData(userData: UserData): Promise<any> {
    try {
      // First, encrypt the user data
      const securePayload = await this.prepareSecureData(userData);

      // Then send it to the server (example using fetch API)
      const response = await fetch('https://api.example.com/secure-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(securePayload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Secure data transmission failed:', error);
      throw error;
    }
  }
}

// Example usage
export const demonstrateEncryption = async () => {
  // Example public key (would normally be provided by the server)
  const serverPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`;

  // Create the secure transmission handler
  const secureTransmitter = new SecureDataTransmission(serverPublicKey);

  // Example sensitive user data
  const sensitiveData: UserData = {
    username: 'johndoe',
    password: 'SecureP@ssw0rd!',
    paymentInfo: {
      cardNumber: '4111111111111111',
      expiry: '12/25',
      cvv: '123',
    },
    personalInfo: {
      ssn: '123-45-6789',
      dateOfBirth: '1980-01-01',
    },
  };

  try {
    // Prepare the data for secure transmission
    const encryptedPayload =
      await secureTransmitter.prepareSecureData(sensitiveData);

    console.log('Original data:', sensitiveData);
    console.log('Encrypted payload:', encryptedPayload);

    // In a real application, you would then send this to your server:
    // await secureTransmitter.sendSecureData(sensitiveData);

    return encryptedPayload;
  } catch (error) {
    console.error('Encryption demonstration failed:', error);
    throw error;
  }
};

// Export for module usage
export { SecureDataTransmission };
