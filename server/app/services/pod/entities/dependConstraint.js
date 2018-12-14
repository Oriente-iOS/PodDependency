'use strict';

class DependConstraint {
  constructor(podName) {
    this.podName = podName;
    this.constraint = '=';
  }

  addConstraint(version, constraint) {
    this.constraint = constraint.length > 0 ? constraint : '=';
    this.version = version;
  }
}


module.exports = DependConstraint;
