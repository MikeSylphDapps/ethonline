/**
 * Creates an img element with its src set to the blob
 * @param {*} blob 
 * @returns the img element
 */
export const createImageFromBlob = blob => {
  const img = document.createElement('img')
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    URL.revokeObjectURL(url);
  };
  img.src = url;
  return img;
};

/**
 * Creates an img element with its src set to the url
 * @param {*} url 
 * @returns the img element
 */
export const createImageFromUrl = url => {
  const img = document.createElement('img')
  img.src = url;
  return img;
};