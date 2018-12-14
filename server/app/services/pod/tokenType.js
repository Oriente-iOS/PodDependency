'use strict';

const TokenType = {
  EOF: Symbol(),
  Punctuator: Symbol(),
  Keyword: Symbol(),
  Indentation: Symbol(),
  Identifier: Symbol(),
  VersionLiteral: Symbol(),
  EOL: Symbol(),
  Link: Symbol(),

};


module.exports = TokenType;
