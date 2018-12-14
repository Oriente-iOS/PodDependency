/* eslint-disable no-unused-vars */
'use strict';

const fs = require('fs');

module.exports = {

  async checkIfFileExists(filePath) {
    return new Promise((resolve, reject) => {
      fs.exists(filePath, ret => {
        resolve(ret);
      });
    });
  },

  async removeEmptyFolder(path) {
    return new Promise((resolve, reject) => {
      fs.rmdir(path, ret => {
        resolve(ret);
      });
    });
  },

  async readFolderContents(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, arr) => {
        resolve(arr);
      });
    });
  },

  async getFileState(path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, state) => {
        resolve(state);
      });
    });
  },

  async unlinkFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, ret => {
        resolve(ret);
      });
    });
  },

  async createNewFolder(path) {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, err => {
        reject(err);
      });
    });
  },

  async deleteFolderRecursive(path) {
    const fsExist = await this.checkIfFileExists(path);
    if (fsExist) {
      const contents = await this.readFolderContents(path);
      if (contents) {
        for (let i = 0; i < contents.length; i++) {
          const file = contents[i];
          const curPath = path + '/' + file;
          const sta = await this.getFileState(curPath);
          if (sta && sta.isDirectory()) { // recurse
            await this.deleteFolderRecursive(curPath);
          } else { // delete file
            await this.unlinkFile(curPath);
          }
        }
      }
      await this.removeEmptyFolder(path);
    }
  },

};

