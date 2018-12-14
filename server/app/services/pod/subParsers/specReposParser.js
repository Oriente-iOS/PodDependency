'use strict';

// const Tokenizer = require('../tokenizer');
// const Token = require('../token');
const TokenType = require('../tokenType');
const { SPEC_REPOS } = require('../parserType');
// const Node = require('../entities/node');
class SpecReposParser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.context = {};
    this.tokenizer.switchToParser(SPEC_REPOS);
    const description = this.tokenizer.getNextTokenLine();
    if (description instanceof Array) {
      const token = description.slice(0, 1);
      // eslint-disable-next-line eqeqeq
      if (token.type == TokenType.Keyword && token.value == SPEC_REPOS) {
        console.log('Parser initial normly');
      }
    }
  }

  parse() {

  }
}


module.exports = SpecReposParser;

