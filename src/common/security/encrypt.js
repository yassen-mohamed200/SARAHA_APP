import CryptoJS from "crypto-js";
export const encryptValue = ({ plainText, secretKey }) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

export const decryptValue = ({ encryptedText, secretKey }) => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  return decryptedBytes.toString(CryptoJS.enc.Utf8);
};