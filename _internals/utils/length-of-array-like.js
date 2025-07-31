function lengthOfArrayLike(arrayLike) {
  if (typeof arrayLike !== 'object') {
    return 0;
  }
  
  return arrayLike.length;
}

module.exports = lengthOfArrayLike;
