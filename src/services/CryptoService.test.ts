/**
 * Unit tests for the CryptoService
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CryptoService, encryptWithPublicKey } from './CryptoService';

describe('CryptoService', () => {
  // Mock for window.crypto.subtle
  let mockSubtle: any;

  // Mock keys for testing
  const mockPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`;

  // Mock response from crypto.subtle.encrypt
  const mockEncryptedData = new Uint8Array([1, 2, 3, 4, 5]);

  // Setup mocks before each test
  beforeEach(() => {
    // Mock the crypto API
    mockSubtle = {
      importKey: vi.fn().mockResolvedValue('mock-imported-key'),
      encrypt: vi.fn().mockResolvedValue(mockEncryptedData.buffer),
    };

    // Mock the global crypto object
    vi.stubGlobal('crypto', {
      subtle: mockSubtle,
    });

    // Mock TextEncoder
    vi.stubGlobal(
      'TextEncoder',
      class {
        encode(text: string) {
          return new Uint8Array(
            Array.from(text).map((char) => char.charCodeAt(0)),
          );
        }
      },
    );

    // Mock atob function
    vi.stubGlobal(
      'atob',
      vi.fn().mockImplementation((base64String) => {
        // Simple mock implementation
        return 'decoded-binary-data';
      }),
    );

    // Mock btoa function
    vi.stubGlobal(
      'btoa',
      vi.fn().mockImplementation((binaryString) => {
        // Simple mock implementation
        return 'base64-encoded-result';
      }),
    );

    // Mock String.fromCharCode.apply
    const originalFromCharCode = String.fromCharCode;
    String.fromCharCode = function () {
      return 'mock-char-code-result';
    };
    String.fromCharCode.apply = vi
      .fn()
      .mockReturnValue('mock-char-code-applied');
  });

  // Clean up mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe('encryptWithPublicKey', () => {
    it('should successfully encrypt data with a public key', async () => {
      const text = 'test-data';

      const result = await CryptoService.encryptWithPublicKey(
        text,
        mockPublicKeyPem,
      );

      // Verify the proper methods were called
      expect(global.atob).toHaveBeenCalled();
      expect(mockSubtle.importKey).toHaveBeenCalledWith(
        'spki',
        expect.any(Uint8Array),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['encrypt'],
      );

      expect(mockSubtle.encrypt).toHaveBeenCalledWith(
        {
          name: 'RSA-OAEP',
        },
        'mock-imported-key',
        expect.any(Uint8Array),
      );

      expect(global.btoa).toHaveBeenCalled();
      expect(result).toBe('base64-encoded-result');
    });

    it('should handle a public key without PEM header/footer', async () => {
      const text = 'test-data';
      const keyWithoutHeaders = mockPublicKeyPem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');

      await CryptoService.encryptWithPublicKey(text, keyWithoutHeaders);

      // Verify atob was called directly with the key content
      expect(global.atob).toHaveBeenCalledWith(keyWithoutHeaders);
    });

    it('should throw an error when text is empty', async () => {
      await expect(
        CryptoService.encryptWithPublicKey('', mockPublicKeyPem),
      ).rejects.toThrow('Invalid input: text must be a non-empty string');
    });

    it('should throw an error when text is not a string', async () => {
      await expect(
        // @ts-ignore - Intentionally passing wrong type for test
        CryptoService.encryptWithPublicKey(123, mockPublicKeyPem),
      ).rejects.toThrow('Invalid input: text must be a non-empty string');
    });

    it('should throw an error when publicKeyPem is empty', async () => {
      await expect(
        CryptoService.encryptWithPublicKey('test-data', ''),
      ).rejects.toThrow(
        'Invalid input: publicKeyPem must be a non-empty string',
      );
    });

    it('should throw an error when publicKeyPem is not a string', async () => {
      await expect(
        // @ts-ignore - Intentionally passing wrong type for test
        CryptoService.encryptWithPublicKey('test-data', null),
      ).rejects.toThrow(
        'Invalid input: publicKeyPem must be a non-empty string',
      );
    });

    it('should handle encryption errors gracefully', async () => {
      // Mock the encrypt function to throw an error
      mockSubtle.encrypt.mockRejectedValue(new Error('Encryption error'));

      await expect(
        CryptoService.encryptWithPublicKey('test-data', mockPublicKeyPem),
      ).rejects.toThrow('Encryption failed: Encryption error');
    });
  });

  describe('ensureCryptoSupport', () => {
    it('should execute the wrapped function when crypto is available', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');
      const wrapped = CryptoService.ensureCryptoSupport(mockFn);

      const result = await wrapped('arg1', 'arg2');

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('result');
    });

    it('should throw an error when crypto is not available', async () => {
      // Remove the crypto object temporarily
      vi.unstubAllGlobals();
      vi.stubGlobal('crypto', undefined);

      const mockFn = vi.fn();
      const wrapped = CryptoService.ensureCryptoSupport(mockFn);

      await expect(wrapped()).rejects.toThrow(
        'Web Crypto API is not supported in this environment',
      );

      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should throw an error when crypto.subtle is not available', async () => {
      // Remove the subtle object temporarily
      vi.unstubAllGlobals();
      vi.stubGlobal('crypto', { subtle: undefined });

      const mockFn = vi.fn();
      const wrapped = CryptoService.ensureCryptoSupport(mockFn);

      await expect(wrapped()).rejects.toThrow(
        'Web Crypto API is not supported in this environment',
      );

      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('exported encryptWithPublicKey function', () => {
    it('should be a wrapped version of CryptoService.encryptWithPublicKey', async () => {
      // Spy on the encryptWithPublicKey method
      const spy = vi.spyOn(CryptoService, 'encryptWithPublicKey');

      await encryptWithPublicKey('test-data', mockPublicKeyPem);

      expect(spy).toHaveBeenCalledWith('test-data', mockPublicKeyPem);
    });
  });
});
