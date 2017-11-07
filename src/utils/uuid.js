const sourceStr = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const UUIDHelper = {
  generateUUID(length = 8) {
    const uuidStrings = [];
    while (length--) {
      const digit = Math.floor(Math.random() * (sourceStr.length - 1));
      uuidStrings.push(sourceStr.charAt(digit));
    }
    return uuidStrings.join('');
  },
};
export default UUIDHelper;
