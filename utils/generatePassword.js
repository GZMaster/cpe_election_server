const generatePassword = (length) => {
  let password = "";
  const possibleCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    password += possibleCharacters.charAt(
      Math.floor(Math.random() * possibleCharacters.length)
    );
  }

  return password;
};

module.exports = generatePassword;
