'use strict';

const TokenType = require('./tokenType');
const Token = require('./token');
const Character = require('./character');
const { PODS, DEPENDENCIES, SPEC_REPOS, SPEC_CHECKSUMS,
  EXTERNAL_SOURCES, CHECKOUT_OPTIONS, PODFILE_CHECKSUM,
  COCOAPODS } = require('./parserType');

const Identifier_Reg = /^([A-Za-z][A-Z_a-z0-9\-\/\+]*)/;
const Version_Reg = /^(=|>=?|<=?|~>)?\s*((?:[\da-f]+\.?)+)/;
const Link_Reg = /^([a-z]+\:\/|\.)(?:\/[A-Z_a-z0-9\-\.]+)+\/?/;


class Scanner {
  constructor(code) {
    this.code = code;
    this.length = code.length;
    this.lineNumber = code.length > 0 ? 1 : 0;
    this.index = 0;
  }

  eof() {
    return this.index >= this.code.length;
  }

  getIdentifier() {
    let start = this.index;
    const matched = Identifier_Reg.exec(this.code.slice(start));
    let val;
    if (matched != null) {
      val = RegExp.$1;
      start += matched.index;
      this.index = start + val.length;
    }
    return val;
  }

  getVersion() {
    let start = this.index;
    const matched = Version_Reg.exec(this.code.slice(start));
    let val;
    if (matched != null) {
      val = { flag: RegExp.$1, val: RegExp.$2 };
      start += matched.index;
      this.index = start + matched[0].length;
    }
    return val;
  }

  getLink() {
    const start = this.index;
    const matched = Link_Reg.exec(this.code.slice(start));
    let val;
    if (matched != null) {
      this.index = start + matched[0].length;
      val = matched[0];
    }
    return val;
  }

  getPunctuator() {
    const start = this.index;
    const val = this.code.slice(start, start + 1);
    this.index++;
    const ret = [ ':', '-', '"', '`', ',', '(', ')' ].includes(val);
    return ret ? val : undefined;
  }

  isKeyword(identifier) {
    switch (identifier) {
      case PODS:
        return true;
      case DEPENDENCIES:
        return true;
      case COCOAPODS:
        return true;
      default: {
        if (SPEC_REPOS.indexOf(identifier) !== -1) {
          this.index++;
          const val = this.getIdentifier();
          return SPEC_REPOS.indexOf(val) !== -1 ? true : (SPEC_CHECKSUMS.indexOf(val) !== -1);
        } else if (EXTERNAL_SOURCES.indexOf(identifier) !== -1) {
          this.index++;
          const val = this.getIdentifier();
          return EXTERNAL_SOURCES.indexOf(val) !== -1;
        } else if (CHECKOUT_OPTIONS.indexOf(identifier) !== -1) {
          this.index++;
          const val = this.getIdentifier();
          return CHECKOUT_OPTIONS.indexOf(val) !== -1;
        } else if (PODFILE_CHECKSUM.indexOf(identifier) !== -1) {
          this.index++;
          const val = this.getIdentifier();
          return PODFILE_CHECKSUM.indexOf(val) !== -1;
        }

        return false;

      }
    }
  }

  scanIdentifier() {
    const start = this.index;
    let id = this.getLink();
    if (id != null) {
      const token = new Token();
      token.lineNumber = this.lineNumber;
      token.start = start;
      token.end = this.index;
      token.value = id;
      token.type = TokenType.Link;
      return token;
    }
    this.index = start;
    id = this.getIdentifier();
    if (id != null) {
      const token = new Token();
      token.value = id;
      token.lineNumber = this.lineNumber;
      token.start = start;
      token.end = this.index;
      token.type = TokenType.Identifier;
      if (this.isKeyword(id)) {
        if (this.index !== token.end) {
          token.end = this.index;
          token.value = this.code.slice(token.start, token.end).trim();
        }
        token.type = TokenType.Keyword;
      }
      return token;
    }
    this.index = start;
    id = this.getVersion();
    if (id != null) {
      const token = new Token();
      token.constraint = id.flag;
      token.value = id.val;
      token.lineNumber = this.lineNumber;
      token.start = start;
      token.end = this.index;
      token.type = TokenType.VersionLiteral;
      return token;
    }
    this.index = start;

    return undefined;
  }

  scanIndentation() {
    const start = this.index;
    let indent = 0;
    while (!this.eof()) {
      const ch = this.code.charCodeAt(this.index);
      if (Character.isWhiteSpace(ch)) {
        this.index++;
        indent++;
      } else {
        break;
      }
    }
    const token = new Token();
    token.value = indent;
    token.lineNumber = this.lineNumber;
    token.start = start;
    token.end = this.index;
    token.type = TokenType.Indentation;
    return indent > 0 ? token : null;
  }
  skipNewLine() {
    const start = this.index;
    while (!this.eof()) {
      const ch = this.code.charCodeAt(this.index);
      if (Character.isLineTerminator(ch)) {
        this.index++;
        this.lineNumber++;
      } else {
        break;
      }
    }
    const token = new Token();
    token.type = TokenType.EOL;
    return this.index > start ? token : undefined;
  }

  skipPunctuator() {
    const start = this.index;
    const id = this.getPunctuator();
    if (id != null) {
      const token = new Token();
      token.value = id;
      token.lineNumber = this.lineNumber;
      token.start = start;
      token.end = this.index;
      token.type = TokenType.Punctuator;
      return token;
    }
    this.index = start;
    return undefined;

  }

}


module.exports = Scanner
;
