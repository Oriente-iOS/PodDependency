/* eslint-disable valid-jsdoc */
'use strict';

const os = require('os');
const path = require('path');
const _ = require('lodash');
const LockfileParserDelegateImpl = require('./pod/lockfileParserDelegateImpl');
const command = require('./spec/command');
const SpecStream = require('./spec/specStream');
const nodeScheduler = require('./pod/nodeScheduler');
const utility = require('./pod/utility');

module.exports = {

  /**
   * @param {*} lockFilePath :The abstract server file path of Podfile.lock
   */

  async startToParserPodfile(lockFilePath) {
    const paserImp = new LockfileParserDelegateImpl();
    return await paserImp.podlockfileInterpretation(lockFilePath);
  },

  /**
    * @param lockFilePath : The abstract server file path of Podfile.lock
    * @param podList : All pods' name which whould be upgraded
    * @return — type: The dependency pod list which acturally need to upgraded
    */

  async findDependencyList(lockFilePath, podList) {
    const paserImp = new LockfileParserDelegateImpl();
    return await paserImp.podlockfileInterpretationWithList(lockFilePath, podList);
  },

  /**
    * @param node : The single pod which need to be upgraded, it contains the upgrade info and new version
    * @param oldVersion : The last version of the pod
    */

  async upgradePod(node, oldVersion, signature) {
    const localFolder = path.join(os.tmpdir(), node.podName);
    try {
      // check the if pod folder already exists
      const fsState = await utility.checkIfFileExists(localFolder);
      if (fsState) {
        await utility.deleteFolderRecursive(localFolder);
      }
    } catch (error) {
      throw new Error('Local Folder- ' + node.podName + ': Delete failed ' + error.message);
    }

    let nodeSourceInfo;
    try {
      nodeSourceInfo = await command.searchPod(node.podName);
    } catch (error) {
      throw new Error('Search Pod- ' + node.podName + ': Invalid Pod ' + error.message);
    }

    // clone the pod to local folder
    let podRepo;
    try {
      podRepo = await command.cloneRepo(command.reviseSSHUrl(nodeSourceInfo.source), localFolder);
    } catch (error) {
      throw new Error('Clone Pod- ' + node.podName + ': Clone Failed ' + error.message);
    }

    // check if the new tag already exists
    const newTagStat = await command.tagIsExitInRepo(podRepo, node.version);
    if (!newTagStat) {
      try {
        const commitId = await command.getMasterCommit(podRepo);
        await command.pushNewTag(podRepo, commitId, node.version, signature);
      } catch (error) {
        throw new Error('Push New Tag- ' + node.podName + ': Push Failed ' + error.message);
      }

      try {
        const specRepoInfo = await command.podSpecsInfo(node.podName, oldVersion);
        const specStream = new SpecStream(specRepoInfo.path);
        const newPath = path.join(os.tmpdir(), node.podName + '.podspec');

        await specStream.revise(newPath, node.version, _.reduce(node.dependencies, (ret, o) => {
          if (o.version) {
            if (o.constraint === '=') {
              ret[o.podName] = `${o.version}`;
            } else {
              ret[o.podName] = `${o.constraint || '='} ${o.version}`;
            }
          } else {
            ret[o.podName] = '';
          }
          return ret;
        }, Object.create(null)));
        // 临时解决: 因为库push之后，本地的pod库并没有指向最新，必须要执行一次 pod repo update
        await command.asyncPodRepoUpdate();
        return await command.asyncPodRepoPush(specRepoInfo.repo, newPath);
      } catch (error) {
        throw new Error('Push Specs- ' + node.podName + ': Push Failed ' + error.message);
      }
    } else {
      throw new Error(node.podName + 'New Tag Check- ' + node.version + ': Already Exists.');
    }
  },

  /**
     * @param preNode : The previous upgraded pod
     * @param seq : The whole pods list the returns of 'findDependencyList'
     * @returns {next, seq}: Return the next node and the updated dependency list
     *
     * This method schedule the upgrade sequence based on the 'preNode' and 'seq's dependency list ’
     */
  scheduleNextNode(preNode, seq) {
    return nodeScheduler.updateNextNode(seq, preNode);
  },

};
