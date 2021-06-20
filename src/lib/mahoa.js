const CryptoJS = require("crypto-js");

const encrypt = (mess) => {
  const rawStr = CryptoJS.AES.encrypt(mess, process.env.URL_SECRET).toString();
  const wordArray = CryptoJS.enc.Utf8.parse(rawStr);
  const base64 = CryptoJS.enc.Base64.stringify(wordArray);

  return base64;
};

const decrypt = (mess) => {
  const parsedWordArray = CryptoJS.enc.Base64.parse(mess);
  const parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
  const bytes = CryptoJS.AES.decrypt(parsedStr, process.env.URL_SECRET);
  const idMovieStream = bytes.toString(CryptoJS.enc.Utf8);

  return idMovieStream;
};

module.exports = {
  encrypt,
  decrypt,
};
