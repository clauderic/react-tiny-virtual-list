const ARR_LENGTH = 500;

export const generateArr = (count = ARR_LENGTH, postfix = '') => {
  const arr = [];
  for (var i = 0; i < count; i++) {
    arr.push(`${count- i}${postfix}`);
  }
  return arr;
};
