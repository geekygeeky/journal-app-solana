import { type ClassValue, clsx } from 'clsx'
import { v4 as uuidv4 } from 'uuid';
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}


/**
 * Generates a UUID v4 and converts it to a Uint8Array.
 * @returns A Uint8Array representing the UUID.
 */
export function generateUuidV4AsUint8Array(): Uint8Array<ArrayBufferLike> {
  const uuidString = uuidv4();
  // Remove hyphens and convert to a byte array
  const hexString = uuidString.replace(/-/g, '');
  const uint8Array = new Uint8Array(16); // A UUID is 16 bytes (128 bits)
  for (let i = 0; i < 16; i++) {
    uint8Array[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return uint8Array;
}

export function convertUint8ArrayToUuidV4(uuidUint8Array: Uint8Array): string {
  if (uuidUint8Array.length !== 16) {
    throw new Error('Invalid UUID byte array length. Expected 16 bytes.');
  }

  let hexString = '';
  for (let i = 0; i < uuidUint8Array.length; i++) {
    hexString += uuidUint8Array[i].toString(16).padStart(2, '0');
  }

  // Add hyphens back to form the standard UUID string format
  return `${hexString.substring(0, 8)}-${hexString.substring(8, 12)}-${hexString.substring(12, 16)}-${hexString.substring(16, 20)}-${hexString.substring(20, 32)}`;
}

export function uuidToBuffer(uuid: string): Buffer {
  if (!uuid) {
    // Return empty buffer  
    return Buffer.alloc(16);
  }
  const hexStr = uuid.replace(/-/g, '');

  if (uuid.length != 36 || hexStr.length != 32) throw new Error(`Invalid UUID string: ${uuid}`);

  return Buffer.from(hexStr, 'hex');

}


export function bufferToUUID(buffer: Buffer): string {
  if (buffer.length != 16) throw new Error(`Invalid buffer length for uuid: ${buffer.length}`);
  if (buffer.equals(Buffer.alloc(16))) {
    // If buffer is all zeros, return empty string 
    return '';
  };
  const str = buffer.toString('hex');
  return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)};`
}