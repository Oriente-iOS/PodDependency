'use strict';

const Scanner = require('./scanner');
const TokenType = require('./tokenType');

class Context {
  constructor() {
    this.sections = {};
    this.currentSection = undefined;
    this.currentLine = undefined;
  }
  // 增加一个新的token
  addNewField(token) {
    if (token.value != null) {
      this.sections[token.value] = [];
      this.currentSection = this.sections[token.value];
      this.addNewLine();
      this.appendNewItem(token); // 第一行是Field 相关的信息
    } else {
      throw 'No field matched';
    }
  }
  addNewLine() {
    if (this.currentSection instanceof Array) {
      this.currentSection.push([]);
      this.currentLine = this.currentSection[this.currentSection.length - 1];
    } else {
      throw 'No Section matched';
    }
  }
  appendNewItem(token) {
    if (this.currentLine instanceof Array) {
      this.currentLine.push(token);
    } else {
      throw 'No Validated Line mathed';
    }
  }
}


class Tokenizer {

  constructor(code) {
    this.context = new Context();
    this.scanner = new Scanner(code);
    this.tp = 0; // token pointer
    this.lp = 0; // line pointer
    this.tokens; // 当前parser的token
  }


  lex() {
    // eslint-disable-next-line no-unused-vars
    let currentLine = this.scanner.lineNumber;
    let privousToken; // 用于区分换行符和identifier
    while (!this.scanner.eof()) {
      let token = this.scanner.skipNewLine();
      if (token != null) {
        currentLine = this.scanner.lineNumber;
        privousToken = token;
        continue;
      }
      token = this.scanner.scanIndentation();
      if (token != null) {
        // eslint-disable-next-line eqeqeq
        if (privousToken == null || privousToken.type == TokenType.EOL) {
          // todo: 表示是段最前面的indentToken 进行处理
          this.context.addNewLine();
          this.context.appendNewItem(token);// 表示缩进级别的
          // eslint-disable-next-line eqeqeq
          privousToken == token;
        }
        currentLine = this.scanner.lineNumber;
        continue;
      }
      // 处理
      token = this.scanner.scanIdentifier();
      if (token != null) {
        // eslint-disable-next-line eqeqeq
        if (token.type == TokenType.Keyword) {
          this.context.addNewField(token);
        } else {
          // todo: 如果是一个newline
          this.context.appendNewItem(token);
        }
        privousToken = token;
        currentLine = this.scanner.lineNumber;
        continue;
      }
      token = this.scanner.skipPunctuator();
      if (token != null) {
        privousToken = token;
        currentLine = token.lineNumber;
        continue;
      }

    }
  }

  getNextToken() {
    if (this.tokens.length > this.lp) {
      const tokenline = this.tokens[this.lp];
      if (tokenline.length > this.tp) {
        return tokenline[this.tp++];
      }
      this.tp = 0;
      this.lp++;
      return this.getNextToken();

    }
    return null;
  }
  getNextTokenLine() {
    return this.tokens.length > this.lp ? this.tokens[this.lp++] : null;
  }
  switchToParser(name) {
    this.tokens = this.context.sections[name];
    this.tp = 0;
    this.lp = 0;
  }

}


module.exports = Tokenizer;
