function isChar32Bit(c) {
  return c.codePointAt(0) > 0xFFFF;
}

module.exports = isChar32Bit;
