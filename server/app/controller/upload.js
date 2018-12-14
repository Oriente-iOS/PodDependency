'use strict';

const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const util = require('../services/pod/utility');

class UploadController extends Controller {
  async index() {
    const ctx = this.ctx;
    const stream = await ctx.getFileStream();
    // generate a new file name
    const filename = stream.filename;
    const target = path.join(this.config.baseDir, 'app/public/uploads', filename);
    const folderExist = await util.checkIfFileExists(path.join(this.config.baseDir, 'app/public/uploads'));
    if (!folderExist) {
      await util.createNewFolder(path.join(this.config.baseDir, 'app/public/uploads'));
    }
    const writeStream = fs.createWriteStream(target);
    try {
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      await sendToWormhole(stream);
      throw err;
    }
    ctx.body = {
      url: 'app/public/uploads/' + filename,
    };
  }
}

module.exports = UploadController;
