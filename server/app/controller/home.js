'use strict';

const path = require('path');
const upgradeService = require('../services/podUpgradeService');

const Controller = require('egg').Controller;


function isEmpty(value) {
  return (Array.isArray(value) && value.length === 0) || (Object.prototype.isPrototypeOf(value) && Object.keys(value).length === 0);
}

class HomeController extends Controller {
  async index() {
    await this.ctx.render('home');
  }

  async parser() {
    const lockFilePath = path.join(this.config.baseDir, 'app/public/uploads/Podfile.lock');
    let arr;
    try {
      arr = await upgradeService.startToParserPodfile(lockFilePath);
    } catch (error) {
      console.log(error);
    }
    this.ctx.body = arr;
  }

  async dependency() {
    const lockFilePath = path.join(this.config.baseDir, 'app/public/uploads/Podfile.lock');
    const selectedArr = this.ctx.request.body.selectedArr;
    if (isEmpty(selectedArr)) {
      throw new Error('Please select the Pods need to be upgraded!!!');
    } else {
      let arr;
      try {
        arr = await upgradeService.findDependencyList(lockFilePath, selectedArr);
      } catch (error) {
        console.log(error);
      }
      this.ctx.body = arr;
    }

  }

  async testPost() {
    console.log(this.ctx.request.body.name);
    this.ctx.body = 'success';
  }

  async next() {
    try {
      const requestBody = this.ctx.request.body;
      const ret = upgradeService.scheduleNextNode(requestBody.node, requestBody.seq);
      this.ctx.body = ret;
    } catch (error) {
      console.log(error);
    }
  }

}

module.exports = HomeController;
