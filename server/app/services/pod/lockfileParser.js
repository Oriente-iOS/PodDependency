'use strict';

const stream = require('stream');
const fs = require('fs');
const Tokenizer = require('./tokenizer');
const DependenciesParser = require('./subParsers/dependenciesParser');
const PodsParser = require('./subParsers/podsParser');

class LockfileParser extends stream.Transform {

  constructor() {
    super({ objectMode: true });
    this.stat = 'pending';
    this.data = [];
  }

  // 根据上传的file进行解析
  async parse(path) {
    if (this.stat === 'processing') {
      return Promise.reject('1');
    }
    this.stat = 'processing';
    this.rawStream = fs.createReadStream(path);
    this.rawStream.pipe(this);
    this.body = {};
    this.on('data', data => {
      Object.assign(this.body, data);
    });
    return new Promise(res => {
      this.on('finish', () => res(this.body));
    });

  }

  _transform(data, encoding, callback) {
    const contentStr = data.toString();
    const tokenizer = new Tokenizer(contentStr);
    tokenizer.lex();
    const dependParser = new DependenciesParser(tokenizer);
    dependParser.parse();
    const podParser = new PodsParser(tokenizer);
    podParser.parse(dependParser.context);
    this.push(podParser.context);
    callback();
  }

}

module.exports = LockfileParser;
