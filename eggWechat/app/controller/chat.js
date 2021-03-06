const Controller = require('egg').Controller;

class ChatController extends Controller {
  // 连接socket
  async connect() {
    const {
      ctx,
      app
    } = this;
    if (!ctx.websocket) {
      ctx.throw(400, '非法访问');
    }

    // console.log(`clients: ${app.ws.clients.size}`);

    // 监听接收消息和关闭socket
    ctx.websocket
      .on('message', msg => {
        // console.log('接收消息', msg);
      })
      .on('close', (code, reason) => {
        // 用户下线
        console.log('用户下线', code, reason);
        let user_id = ctx.websocket.user_id;
        if (app.ws.user && app.ws.user[user_id]) {
          delete app.ws.user[user_id];
        }
      });

  }
}
module.exports = ChatController;