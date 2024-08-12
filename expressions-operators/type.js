function getType(obj) {
  const type = typeof obj;
  if(type !== 'object') {
    return type;
  }

  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
}

console.log(getType([]));
console.log(getType('123'));
console.log(getType(null));
console.log(getType(undefined));
console.log(getType());
console.log(getType(function(){}));
console.log(getType(/123/g));
