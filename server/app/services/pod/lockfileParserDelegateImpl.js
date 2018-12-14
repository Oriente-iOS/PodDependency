'use strict';

const LockfileParserDelegate = require('./lockfileParserDelegate');
const LockfileParser = require('./lockfileParser');
const _ = require('lodash');
const Node = require('./entities/node');
function mergeChain(chain1, chain2) {
  let index = -1;
  for (const i in chain2) {
    index = _.findIndex(chain1, o => { return o.podName === chain2[i].podName; });
    // 找到了
    if (index !== -1) {
      const subArr = Array.prototype.slice.call(chain2, 0, i);
      for (const j in subArr) {
        // eslint-disable-next-line no-bitwise
        chain1.splice(index + (~~j), 0, subArr[j]);
      }
      return chain1;
    }
  }
  return chain1.concat(chain2);
}

function buildChain(node) {
  const inverseDeps = node.inversionDependencies;
  if (inverseDeps == null || inverseDeps.length === 0) {
    return [ node ];
  }
  let arr = [];
  for (const ele of inverseDeps) {
    arr.push(buildChain(ele));
  }
  arr = Array.prototype.reduce.call(arr, mergeChain);
  arr.unshift(node);
  return arr;

}


class LockfileParserDelegateImpl extends LockfileParserDelegate {

  constructor() {
    super();
    this.parser = new LockfileParser();
  }

  async podlockfileInterpretation(path) {
    this.context = await this.parser.parse(path);
    return this.context;
  }

  async podlockfileInterpretationWithList(path, dependencies) {
    this.context = await this.parser.parse(path);
    return this.buildDependenciesGraph(dependencies);
  }


  buildDependenciesGraph(dependencies) {
    const node = new Node();
    for (const i of dependencies) {
      const tmp = this.context[i];
      tmp && (node.addInverseDependency(tmp));
    }
    return buildChain(node).slice(1);
  }

  podsRefs() {
    return Object.keys(this.context);
  }

}


module.exports = LockfileParserDelegateImpl;

