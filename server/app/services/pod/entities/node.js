'use strict';

// const DependConstraint = require('./dependConstraint');

class Node {
  constructor() {
    this.inversionDependencies = []; // 反向依赖
    this.dependencies = {}; // 正向依赖
    this.podName = '';
    this.remoteRepo = '';
    this.version = '';
    this.vc = undefined; // 表示version constraint
    this.branchType = 'tag';
    this.commit = undefined;
  }

  // 增加正向与反向依赖关系
  addInverseDependency(node) {
    this.inversionDependencies.push(node);
  }

  addDependecyConstraint(constraint) {
    this.dependencies[constraint.podName] = constraint;
  }

  // 判断版本是否需要升级
  // needVersionUpdate(requestVersion) {

  // }
}


module.exports = Node;

