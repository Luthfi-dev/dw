/**
 * OmniSave Pro - QR Code Token Cipher
 * Obfuscates and encrypts media download payloads so third-party URLs are never exposed.
 */

export interface QrPayload {
  u: string; // Target media URL
  t: string; // Video title
  l: string; // Format label (e.g., 1080p FHD)
  e: string; // Format ext (e.g., mp4, mp3)
  s?: number | null; // Filesize in bytes
  ts: number; // Timestamp
}

const CIPHER_SALT = 0x5a;

/**
 * Encrypts and encodes a media payload into a URL-safe encrypted token string.
 */
export function encodeQrToken(payload: QrPayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    // XOR obfuscation with salt + UTF-8 encode
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    const obfuscated = new Uint8Array(utf8Bytes.length);
    for (let i = 0; i < utf8Bytes.length; i++) {
      obfuscated[i] = utf8Bytes[i] ^ (CIPHER_SALT + (i % 7));
    }
    
    // Base64URL encoding
    let binary = '';
    for (let i = 0; i < obfuscated.length; i++) {
      binary += String.fromCharCode(obfuscated[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode QR token:', err);
    return '';
  }
}

/**
 * Decodes and decrypts a URL token back into the media payload.
 */
export function decodeQrToken(token: string): QrPayload | null {
  try {
    if (!token) return null;
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i) ^ (CIPHER_SALT + (i % 7));
    }
    const decodedStr = new TextDecoder().decode(bytes);
    const payload = JSON.parse(decodedStr) as QrPayload;
    if (!payload.u || !payload.t) {
      return null;
    }
    return payload;
  } catch (err) {
    console.error('Failed to decode QR token:', err);
    return null;
  }
}
