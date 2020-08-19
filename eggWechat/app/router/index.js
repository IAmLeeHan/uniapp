'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {
    router,
    controller
  } = app;
  router.get('/', controller.home.index);
  // 注册
  router.post('/reg', controller.user.reg);
  // 登录
  router.post('/login', controller.user.login);
  // 退出登录
  router.post('/logout', controller.user.logout);
  // 搜索好友
  router.post('/search/user', controller.search.user)
  // 申请添加好友
  router.post('/apply/addFriend', controller.apply.addFriend)
  // 获取申请列表
  router.get('/apply/:page', controller.apply.list)
  // 处理好友申请
  router.post('/apply/handle/:id', controller.apply.handle)
  // 获取通讯录列表
  router.get('/friend/list', controller.friend.list)
  // 查看好友资料
  router.get('/friend/read/:id', controller.friend.read)
  // 移入/移出 黑名单
  router.post('/friend/setBlack/:id', controller.friend.setBlack)
  // 设置取消星标好友
  router.post('/friend/setstar/:id', controller.friend.setstar)
  // 设置朋友圈权限
  router.post('/friend/setMomentAuth/:id', controller.friend.setMomentAuth)
  // 设置备注和标签
  router.post('/friend/setRemarkTag/:id', controller.friend.setRemarkTag)
  // 举报用户或者群组
  router.post('/report/save', controller.report.save)



  // websocket
  app.ws.use(async (ctx, next) => {
    // 获取参数 ws://localhost:7001/ws?token=123456
    // ctx.query.token
    // 验证用户token
    let user = {};
    let token = ctx.query.token;
    try {
      user = ctx.checkToken(token);
      // 验证用户状态
      let userCheck = await app.model.User.findByPk(user.id);
      if (!userCheck) {
        ctx.websocket.send(JSON.stringify({
          msg: "fail",
          data: '用户不存在'
        }));
        return ctx.websocket.close();
      }
      if (!userCheck.status) {
        ctx.websocket.send(JSON.stringify({
          msg: "fail",
          data: '你已被禁用'
        }));
        return ctx.websocket.close();
      }
      // 用户上线
      app.ws.user = app.ws.user ? app.ws.user : {};
      // 下线其他设备
      if (app.ws.user[user.id]) {
        app.ws.user[user.id].send(JSON.stringify({
          msg: "fail",
          data: '你的账号在其他设备登录'
        }));
        app.ws.user[user.id].close();
      }
      // 记录当前用户id
      ctx.websocket.user_id = user.id;
      app.ws.user[user.id] = ctx.websocket;
      await next();
    } catch (err) {
      console.log(err);
      let fail = err.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
      ctx.websocket.send(JSON.stringify({
        msg: "fail",
        data: fail
      }))
      // 关闭连接
      ctx.websocket.close();
    }
  });

  // 路由配置
  app.ws.route('/ws', controller.chat.connect);
};