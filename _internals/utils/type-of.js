function typeOf(o) {
  const s = Object.prototype.toString.call(o);
  return s.match(/\[object (.*?)\]/)[1].toLowerCase();
}

module.exports = typeOf;
