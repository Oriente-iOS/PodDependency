'use strict';

// const Tokenizer = require('../tokenizer');
// const Token = require('../token');
const TokenType = require('../tokenType');
const { PODS } = require('../parserType');
// const Node = require('../entities/node');
const DependConstraint = require('../entities/dependConstraint');

class PodsParser {

  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.context = {};
    this.tokenizer.switchToParser(PODS);
    const description = this.tokenizer.getNextTokenLine();
    if (description instanceof Array) {
      const token = description.slice(0, 1);
      // eslint-disable-next-line eqeqeq
      if (token.type == TokenType.Keyword && token.value == PODS) {
        console.log('Parser initial normly');
      }
    }
  }

  parse(options) {
    // options 中取出Pods 如果没有则新建之
    let tokenline = this.tokenizer.getNextTokenLine();
    let baseIndent = 0;
    let curNode;
    while (tokenline != null) {
      if (tokenline.length > 1) {
        let token = tokenline[0];
        // eslint-disable-next-line eqeqeq
        if (token.type == TokenType.Indentation) {
          if (token.value > baseIndent && baseIndent === 0) {
            baseIndent = token.value;
          } // 初始的indent赋值
          if (token.value === baseIndent) {
            token = tokenline[1];
            const name = token.value;
            if (name === 'OrienteIdentification') {
              console.log('a');
            }
            const node = options[name];
            if (node != null) {
              curNode = node;
            } else {
              curNode = null;
            }

          } else if (token.value > baseIndent && curNode != null) {
            const token = tokenline[1];
            const arr = token.value.split('/');
            const name = arr[0]; // 获取当前token的Name
            if (curNode.podName.indexOf(name) === -1) {
              // 表示curName不包含,增加依赖
              const tmpNode = options[name] || options[token.value];
              if (tmpNode != null) {
                const dep = new DependConstraint(tmpNode.podName);
                if (tokenline[2] != null) {
                  dep.addConstraint(tokenline[2].value, tokenline[2].constraint);
                }
                curNode.addDependecyConstraint(dep);
                // 增加反向依赖
                tmpNode.addInverseDependency(curNode);
              }


            }
          }// 二级缩进是依赖系
        }
      }
      tokenline = this.tokenizer.getNextTokenLine();
    }
    this.context = options;
  }

}

module.exports = PodsParser
;
