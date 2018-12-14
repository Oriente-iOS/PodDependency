'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  router.get('/', controller.home.index);
  router.get('/parser', controller.home.parser);
  router.post('/dependency', controller.home.dependency);
  router.post('/next', controller.home.next);
  router.post('/upload', controller.upload.index);

  // socket.io
  io.of('/').route('upgrade', io.controller.upgrade.update);
};
