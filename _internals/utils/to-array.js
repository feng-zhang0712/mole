function toArray(arrayLike) {
  if (arrayLike == null) return [];

  const result = [];
  const type = typeof arrayLike;

  if (type === 'string') {
    for (let index = 0; index < arrayLike.length; index++) {
      result.push(arrayLike.charAt(index));
    }
    return result;
  }

  if (
    (type !== 'object' && type !== 'function') ||
    typeof arrayLike.length !== 'number' ||
    arrayLike.length < 0 ||
    !isFinite(arrayLike.length)
  ) {
    return [];
  }

  for (let index = 0; index < arrayLike.length; index++) {
    if (index in arrayLike) {
      result.push(arrayLike[index]);
    } else {
      result.push(undefined);
    }
  }
  
  return result;
}

module.exports = toArray;
