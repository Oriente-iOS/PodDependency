'use strict';

const stream = require('stream');
const fs = require('fs');
const _ = require('lodash');
const reg = /Pod::Spec.new\s+do\s+\|\s*(\w+)\s*\|/;
// const Version_Reg = /^(=|>=?|<=?|~>)?\s*((?:[\da-f]+\.?)+)/;
class SpecStream extends stream.Transform {

  constructor(oldPath) {
    super();
    this.fsStream = fs.createReadStream(oldPath);
    this.blockArg1 = undefined;
    this.lastdependency = 0;
    this.totalLine = [];
  }
  _flush(done) {
    this.push(this.totalLine && this.totalLine.join('\n'));
    done();
  }
  _transform(chunk, encoding, done) {
    const data = chunk.toString();
    const lines = data.split('\n');

    for (const ln in lines) {
      const line = lines[ln];
      let ret = reg.exec(line);
      if (ret != null) {
        this.blockArg1 = ret[1];
        continue;
      }
      const regOfVersion = new RegExp(`^\\s+${this.blockArg1}\\.version\\s*\\=\\s*[\\'\\"]?([\\w\\.]+)[\\"\\']`);
      ret = regOfVersion.exec(line);
      if (ret != null) {
        this.version = ret[1];
        lines[ln] = line.replace(this.version, this.newVersion);
        continue;
      }
      const regOfSource = new RegExp(`^\\s+${this.blockArg1}\\.source`);
      if (line.match(regOfSource) !== null) {
        lines[ln] = line.replace(this.version, this.newVersion);
        continue;
      }

      const regOfDep = new RegExp(`^\\s+${this.blockArg1}\\.dependency`);
      ret = regOfDep.exec(line);
      if (ret != null) {
        const substr = line.substring(ret.index + ret[0].length, line.length);
        const substrArr = _.map(substr.split(','), o => o.trim().replace(/^[\'\"](.*)[\'\"]$/g, '$1'));
        if (this.dependOptions[substrArr[0]]) {
          lines[ln] = `${ret[0]} '${substrArr[0]}', '${this.dependOptions[substrArr[0]]}'`;
          delete this.dependOptions[substrArr[0]];
        }
      }
    }
    this.totalLine = _.concat(this.totalLine, lines);
    done();
  }

  // 输入：(path 类型， version， {podName,'~> version'})
  async revise(newPath, version, dependOptions) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      this.newVersion = version;
      this.newPath = newPath;
      this.dependOptions = Object.assign({}, dependOptions);
      const outPutStream = new fs.createWriteStream(newPath);
      outPutStream.on('finish', () => {
        resolve();
      });
      this.fsStream.pipe(this).pipe(outPutStream);
    });
  }

}

module.exports = SpecStream;
