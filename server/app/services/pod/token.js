'use strict';

class Token {
  constructor() {
    this.type = undefined;
    this.value = '';
    this.lineNumber = 0;
    this.lineStart = 0;
    this.start = 0;
    this.end = 0;
    this.constraint = '';
  }
}

module.exports = Token;
