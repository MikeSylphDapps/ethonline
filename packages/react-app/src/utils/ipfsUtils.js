import { blobToBuffer } from './blobUtils';
import { create } from 'ipfs-http-client';

/**
 * Saves the blob to ipfs and returns the ipfs result ({ path, cid })
 * @param {*} blob 
 * @returns the ipfs result
 */
export const saveBlobToIpfs = async blob => {
  const ipfs = create('https://ipfs.infura.io:5001');
  const buffer = await blobToBuffer(blob);
  const result = await ipfs.add(Buffer.from(buffer));
  return result;
};