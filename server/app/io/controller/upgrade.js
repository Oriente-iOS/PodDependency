'use strict';

const Controller = require('egg').Controller;
const upgradeService = require('../../services/podUpgradeService');

class UpgradeController extends Controller {
  async update() {

    const { ctx, app } = this;
    const socket = ctx.socket;
    try {
      await upgradeService.upgradePod(ctx.args[0].node, ctx.args[0].oldVersion, this.config.gitSignature);
    } catch (error) {
      await socket.emit('updated', error);
      app.logger.error(error);
    }

    try {
      await socket.emit('updated', 'Success');
    } catch (error) {
      // 如果回调失败了，尝试广播一次
      await app.io.sockets.emit('updated', 'Success');
      app.logger.error(error);
    }

  }
}

module.exports = UpgradeController;
