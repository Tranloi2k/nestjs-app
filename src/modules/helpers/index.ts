const removeKeyObject = (obj: { [key: string]: any }, keyToRemove: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.keys(obj).reduce((acc, key) => {
    if (key !== keyToRemove) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export default removeKeyObject;
