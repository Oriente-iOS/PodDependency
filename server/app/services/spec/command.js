/* eslint-disable no-undef */
'use strict';

const shell = require('shelljs');
const _ = require('lodash');
const NodeGit = require('nodegit');
const Tag = NodeGit.Tag;
const Reference = NodeGit.Reference;
const Signature = NodeGit.Signature;
// const Remote = NodeGit.Remote;

const path = require('path');
const os = require('os');
const fs = require('fs');

const Type = /^-\s+Type:/;
const URL = /^-\s+URL:/;
const Path = /^-\s+Path:/;
const Start = /^->\s?/; // 表示pod
const Source = /^\s*-\s+Source:\s+/;
const Versions = /^\s*-\s+Versions:\s+/;
const sshScheme = 'ssh://';
const Host = /^\s*Host/;
const User = /^\s*User/;
const SpecSourceReg = /\.source\s*\=\s*\{(.*)\}/;
let sshInfos;
const sshConfigPath = path.join(os.homedir(), '.ssh', 'config');
const isExit = fs.statSync(sshConfigPath);
if (isExit && isExit.isFile()) {
  const configContent = fs.readFileSync(sshConfigPath, 'utf8');
  const configContentLines = configContent.split('\n');
  const stack = [];
  for (const line of configContentLines) {
    let ret = Host.exec(line);
    if (ret) {
      stack.push({});
      const obj = stack[stack.length - 1];
      const matchStr = line.substring(ret[0].length).trim();
      const mathStrArr = matchStr.split(/\s+/);
      obj.hosts = mathStrArr;
      continue;
    }
    ret = User.exec(line);
    if (ret) {
      const obj = stack[stack.length - 1];
      obj.user = line.substring(ret[0].length).trim();
    }

  }
  sshInfos = _.filter(stack, o => o.hosts && o.user);
}

const credOptions = {
  callbacks: {
    certificateCheck() {
      return 1;
    },
    credentials(url, userName) {
      // this is changed from sshKeyNew to sshKeyFromAgent
      return NodeGit.Cred.sshKeyFromAgent(userName);
    },
  },
};

module.exports = {
  // 判断pod是否有安装
  isPodInstall() {
    const ret = shell.exec('pod --version').stderr;
    return ret == null || ret.length === 0;
  },

  // 获取pod repo 的内容
  // 格式 {name:, url:, path:}
  podrepos() {
    let ret = shell.exec('pod repo');
    // const repos = [];
    const stack = [];
    if (ret.length > 0) {
      // 解析repo
      ret = _.filter(ret.split('\n'), o => o.length > 0);
      for (const line of ret) {
        // eslint-disable-next-line no-empty
        if (line.match(Type) != null) {

        } else if (line.match(URL) != null) {
          const url = line.replace(URL, '').trim();
          stack[stack.length - 1].url = url;
        } else if (line.match(Path) != null) {
          const path = line.replace(Path, '').trim();
          stack[stack.length - 1].path = path;
        } else {
          stack.push({ name: line });
        }
      }
      return _.filter(stack, o => o.path && o.url);
    }
  },

  // 格式：{name:,source:, repos{}}
  searchPod(podName) {
    const cmd = `pod search ${podName} --simple --no-pager`;
    const child = shell.exec(cmd, { async: true });
    let pod = null;

    // eslint-disable-next-line no-unused-vars
    return new Promise((res, rej) => {
      child.stdout.on('data', function(data) {
        // todo:按照行读取，有状态保存，读取到pod 就结束
        const lines = data.split('\n');
        for (const content of lines) {
          if (content.trim().length === 0) continue;
          if (content.match(Start)) {
            const tmp = content.replace(Start, '');
            const Reg = /^([A-Za-z][A-Z_a-z0-9\-\/\+]*)/;
            const ret = Reg.exec(tmp);
            if (ret != null) {
              const str = ret[0];
              pod = (str === podName) ? { name: podName } : null;
            } else {
              pod = null;
            }
            continue;
          }
          // -- 匹配
          if (content.match(Source)) {
            const ret = content.replace(Source, '').trim();
            ret.length > 0 && pod && (pod.source = ret);
          } else if (content.match(Versions)) {
            const ret = content.replace(Versions, '').trim();
            const versions = ret.split('-');
            for (const a of versions) {
              const Reg = /\[([\w\s]+)\]/;
              const result = Reg.exec(a);
              if (result != null) {
                const repo = result[1].replace(/\s+repo$/, '');
                const version = a.substr(0, result.index).trim();
                pod && (pod.repos || (pod.repos = {})) && (pod.repos[repo] = version.split(/\s|,\s/));
              }
            }
          }
          if (pod && pod.source && pod.repos) {
            res(pod);
          }
        }
      });
      child.on('close', function() {
        res(null);
      });

    });
  },

  // 复制git仓库
  async cloneRepo(romteUrl, localPath) {
    return await NodeGit.Clone(romteUrl, localPath, { fetchOpts: Object.assign({}, credOptions) });
  },
  // 打开一个git仓库
  async openRepo(localPath) {
    return await NodeGit.Repository.open(localPath);
  },
  // 给定的tag再该仓库是否存在
  async tagIsExitInRepo(repo, tagName) {
    const tags = await Tag.list(repo);
    return tags && tags.includes(tagName);
  },

  async getMasterCommit(repo) {
    // 找到oid -> 找到 commit ->
    const oid = await Reference.nameToId(repo, 'refs/heads/master');
    return await repo.getCommit(oid);
  },

  async getTagCommit(repo, tagName) {
    // 找到oid -> 找到 commit ->
    const oid = await Reference.nameToId(repo, `refs/tags/${tagName}`);
    //    let oid = await Reference.nameToId(repo,'refs/heads/master')
    return await repo.getCommit(oid);
  },
  // 根据当前commit打tag, 然后提交到远程仓库
  async pushNewTag(repo, commit, newTag, signature) {
    await Tag.create(repo, newTag, commit, Signature.now(signature.name, signature.email), 'auto tag', 1);
    const remotes = await repo.getRemotes();
    const remoteName = (_.isArray(remotes) && remotes.length > 0) ? remotes[0] : null;
    const remote = await repo.getRemote(remoteName);
    await remote.push([ `refs/tags/${newTag}:refs/tags/${newTag}` ], credOptions);
  },
  // 修饰ssh的url
  reviseSSHUrl(url) {
    let tmpUrl = url || '';
    if (tmpUrl.indexOf(sshScheme) === 0) {
      const components = tmpUrl.substring(sshScheme.length).split('/');
      const host = components[0];
      if (host) {
        const index = _.findIndex(sshInfos, sshInfo => {
          return _.findIndex(sshInfo.hosts, o => {
            return host.match(new RegExp(o));
          }) !== -1;
        });
        if (index !== -1) {
          components[0] = `${sshScheme}${sshInfos[index].user}@${host}`;
          tmpUrl = components.join('/');
        }
      }
    }
    return tmpUrl;
  },
  // 根据所在的repo库,和生成的specPath 将spec 文件更新到远端
  podRepoPush(repo, specPath) {
    const source = _.map(this.podrepos(), o => o.url).join(',');
    const command = `pod repo push ${repo} ${specPath} --sources=\'${source}\' --verbose --use-libraries --allow-warnings`;
    return shell.exec(command).code === 0;
  },


  async asyncPodRepoPush(repo, specPath) {
    return new Promise((resolve, reject) => {
      const source = _.map(this.podrepos(), o => o.url).join(',');
      const command = `pod repo push ${repo} ${specPath} --sources=\'${source}\' --verbose --use-libraries --allow-warnings`;
      // eslint-disable-next-line no-unused-vars
      shell.exec(command, (number, msg, err) => {
        console.log(`####### push spec success number: '${number}', mag:'${msg}', err : '${err}'`);
        if (number === 0) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  },

  async asyncPodRepoUpdate() {
    return new Promise((resolve, reject) => {
      const command = 'pod repo update';
      // eslint-disable-next-line no-unused-vars
      shell.exec(command, (number, msg, err) => {
        console.log(`####### pod repo update success number: '${number}', mag:'${msg}', err : '${err}'`);
        if (number === 0) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  },

  // 返回指定pod版本的 repo 与 path
  // 返回值{repo:master, path:}
  async podSpecsInfo(podName, version) {
    const repos = this.podrepos();
    const podInfo = await this.searchPod(podName);
    if (podInfo == null) { return null; }
    let repo = null;
    for (const i in podInfo.repos) {
      // eslint-disable-next-line eqeqeq
      (_.findIndex(podInfo.repos[i], v => v === version) !== -1) && (repo = _.find(repos, r => r.name == i));
    }
    // 目前目录分级针对私有Pod,至于索引的查找算法定位spec文件，目前暂时不支持
    return repo && { repo: repo.name, path: path.join(repo.path, podName, version, `${podName}.podspec`) };

  },
  // 取出specPath 提交的pod 库
  sourceOfSpecs(specPath) {
    return new Promise((res, rej) => {
      fs.readFile(specPath.path || specPath, 'utf8', (err, data) => {
        if (err) rej(err);
        const ret = SpecSourceReg.exec(data);
        if (ret) {
          const components = ret[1].trim().split(',');
          const component = _.find(components, o => o.indexOf(':git') !== -1);
          const url = component.split('=>')[1].trim();
          res(url.replace(/^[\'\"](.*)[\'\"]$/g, '$1'));

        } else {
          rej(new Error('no remote repo find'));
        }
      });
    });
  },


};
