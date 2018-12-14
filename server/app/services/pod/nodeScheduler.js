'use strict';

const _ = require('lodash');
// const Node = require('./entities/node');
const semver = require('semver');

module.exports = {
// 有副作用的函数
// 将依赖关系都改完
  isNeedUpdate(nodeSeq, node) {
    const idx = _.findIndex(nodeSeq, o => o.podName === node.podName);
    const depenedencies = node.dependencies; // 这个是次版本的约束条件
    let needUpdate = false;
    _.forEach(nodeSeq.slice(0, idx), o => {
      const constraintEle = depenedencies[o.podName];
      if (constraintEle != null) {
        const constraint = constraintEle.constraint;
        const constraintVersion = constraintEle.version;
        const version = o.version;
        // eslint-disable-next-line default-case
        switch (constraint) {
          case '=': {
            if (!semver.eq(version, constraintVersion)) {
              // eslint-disable-next-line no-bitwise
              needUpdate |= true;
              if (node.dependencies[o.podName]) {
                node.dependencies[o.podName].version = o.version;
              }
            }
            break;
          }
          case '>': {
            if (!semver.gt(constraintVersion, version)) {
              // eslint-disable-next-line no-bitwise
              needUpdate |= true;
              if (node.dependencies[o.podName]) {
                node.dependencies[o.podName].version = o.version;
              }
            }
            break;
          }
          case '<': {
            if (!semver.lt(constraintVersion, version)) {
              // eslint-disable-next-line no-bitwise
              needUpdate |= true;
              if (node.dependencies[o.podName]) {
                node.dependencies[o.podName].version = o.version;
              }
            }
            break;
          }
          case '>=': {
            if (!semver.gte(constraintVersion, version)) {
              // eslint-disable-next-line no-bitwise
              needUpdate |= true;
              if (node.dependencies[o.podName]) {
                node.dependencies[o.podName].version = o.version;
              }
            }
            break;
          }
          case '<=': {
            if (!semver.lte(constraintVersion, version)) {
              // eslint-disable-next-line no-bitwise
              needUpdate |= true;
              if (node.dependencies[o.podName]) {
                node.dependencies[o.podName].version = o.version;
              }
            }
            break;
          }
          case '~>': {
            if (!semver.satisfies(version, `~${constraintVersion}`)) {
              // eslint-disable-next-line no-bitwise
              needUpdate |= true;
              if (node.dependencies[o.podName]) {
                node.dependencies[o.podName].version = o.version;
              }
            }
            break;
          }
        }
      }
    });
    return needUpdate;
  },

  // 返回{next:/给出next的version/,输入的nodeseq}
  updateNextNode(nodeseq, node) {
    // 1. 找到序列的nextNode
    // 2. 判断nextNode 是否需要更新,
    // 3. 如果需要更新给出推荐的更新节点和新的nodeseq
    if (!(_.isArray(nodeseq) && nodeseq.length > 0)) {
      return;
    }
    let nextNode;
    if (node == null) {
      nextNode = nodeseq[0];
      return { next: nextNode, seq: nodeseq };
    }
    const idx = _.findIndex(nodeseq, o => o.podName === node.podName);
    idx !== -1 && (nodeseq[idx] = node); // 将更新应用到node 中
    idx !== -1 && idx < nodeseq.length - 1 && (nextNode = nodeseq[idx + 1]);

    if (nextNode != null) {
      if (this.isNeedUpdate(nodeseq, nextNode)) {
        return { next: nextNode, seq: nodeseq };
      }
      return this.updateNextNode(nodeseq, nextNode);

    }
    return;
  },
};
