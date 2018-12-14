'use strict';

// const Tokenizer = require('../tokenizer');
// const Token = require('../token');
const TokenType = require('../tokenType');
const { DEPENDENCIES } = require('../parserType');
const Node = require('../entities/node');
class DependenciesParser {

  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.context = {};
    this.tokenizer.switchToParser(DEPENDENCIES);
    const description = this.tokenizer.getNextTokenLine();
    if (description instanceof Array) {
      const token = description.slice(0, 1);
      // eslint-disable-next-line eqeqeq
      if (token.type == TokenType.Keyword && token.value == DEPENDENCIES) {
        console.log('Parser initial normly');
      }
    }
  }


  parse() {
    let tokenline = this.tokenizer.getNextTokenLine();
    while (tokenline != null) {
      // 解析各种token
      const len = tokenline.length;
      let node;
      if (len >= 2) {
        node = new Node();
        const token = tokenline[1];
        node.podName = token.value;
      }
      if (len === 3) {
        const token = tokenline[2];
        if (token.type === TokenType.VersionLiteral) {
          node.version = token.value;
          node.vc = token.constraint;
        }
      } else if (len > 3) {
        let idx = 2;
        let token = tokenline[idx++];
        if (token.value === 'from') {
          token = tokenline[idx++];
          if (token.type === TokenType.Link) {
            node.remoteRepo = token.value;
          }
          if (tokenline.length > idx) {
            token = tokenline[idx++];
            // eslint-disable-next-line eqeqeq
            (token.type == TokenType.Identifier) && (node.branchType = token.value);
          }
          if (tokenline.length > idx) {
            token = tokenline[idx++];
            // eslint-disable-next-line eqeqeq
            (token.type == TokenType.VersionLiteral) && (node.version = token.value);
            // eslint-disable-next-line eqeqeq
            (token.type == TokenType.Identifier) && (node.commit = token.value);
          }
        }
      }
      this.context[node.podName] = node;
      tokenline = this.tokenizer.getNextTokenLine();
    }
  }
}


module.exports = DependenciesParser;
