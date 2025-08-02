function typeOf(o) {
  const s = Object.prototype.toString.call(o);
  return s.match(/\[object (.*?)\]/)[1].toLowerCase();
}

function isArray(o) {
  return o && typeOf(o) === 'array';
}

module.exports = {
  typeOf,
  isArray,
};
