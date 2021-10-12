/**
 * Converts a blob to a buffer suitable for upload to ipfs
 * @param {*} blob 
 * @returns void
 */
export const blobToBuffer = blob => new Promise(resolve => {
  let fileReader = new FileReader();
  fileReader.onload = event => resolve(event.target.result)
  fileReader.readAsArrayBuffer(blob)
});