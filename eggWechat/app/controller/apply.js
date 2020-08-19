'use strict';

const Controller = require('egg').Controller;

class ApplyController extends Controller {
  // 添加好友
  async addFriend() {
    const {
      ctx,
      app
    } = this;
    // 拿到当前用户的id
    let current_user_id = ctx.authUser.id;
    // 参数验证
    ctx.validate({
      friend_id: {
        type: 'int',
        required: true,
        desc: '好友id'
      },
      nickname: {
        type: 'string',
        required: false,
        desc: "昵称"
      },
      lookme: {
        type: 'int',
        required: true,
        range: {
          in: [0, 1]
        },
        desc: '看我'
      },
      lookhim: {
        type: 'int',
        required: true,
        range: {
          in: [0, 1]
        },
        desc: '看他'
      }
    })

    let {
      friend_id,
      nickname,
      lookme,
      lookhim
    } = ctx.request.body;

    // 不能添加自己
    if (current_user_id === friend_id) {
      return ctx.throw(400, "不能添加自己");
    }
    // 对方是否存在
    let user = await app.model.User.findOne({
      where: {
        id: friend_id,
        status: 1
      }
    });
    if (!user) {
      return ctx.throw(400, "该用户不存在或者已被禁用")
    }
    // 之前是否申请过了
    if (await app.model.Apply.findOne({
        where: {
          user_id: current_user_id,
          friend_id,
          status: ['pending', 'agree']
        }
      })) {
      return ctx.throw(400, "您之前已经申请过了")
    }
    // 创建申请
    let apply = await app.model.Apply.create({
      user_id: current_user_id,
      friend_id,
      nickname,
      lookme,
      lookhim
    })
    if (!apply) {
      return ctx.throw(400, "申请失败")
    }
    return ctx.apiSuccess(apply);
  }

  // 获取好友申请列表
  async list() {
    const {
      ctx,
      app
    } = this;
    let current_user_id = ctx.authUser.id;

    let page = ctx.params.page ? parseInt(ctx.params.page) : 1;

    let limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    let offset = (page - 1) * limit;

    let row = await app.model.Apply.findAll({
      where: {
        friend_id: current_user_id
      },
      include: [{
        model: app.model.User,
        attributes: [
          'id',
          'username',
          'nickname',
          'avatar'
        ]
      }],
      offset,
      limit
    });
    let count = await app.model.Apply.count({
      where: {
        friend_id: current_user_id,
        status: 'pending'
      }
    })

    ctx.apiSuccess({
      row,
      count
    })
  }

  // 处理好友申请
  async handle() {
    const {
      ctx,
      app
    } = this;
    let current_user_id = ctx.authUser.id;
    let id = parseInt(ctx.params.id)
    // 参数验证
    ctx.validate({
      nickname: {
        type: 'string',
        required: false,
        desc: "昵称"
      },
      status: {
        type: 'string',
        required: true,
        range: {
          in: ['refuse', 'agree', 'ignore']
        },
        desc: '处理结果'
      },
      lookme: {
        type: 'int',
        required: true,
        range: {
          in: [0, 1]
        },
        desc: '看我'
      },
      lookhim: {
        type: 'int',
        required: true,
        range: {
          in: [0, 1]
        },
        desc: '看他'
      }
    })
    // 查询该申请是否存在
    let apply = await app.model.Apply.findOne({
      where: {
        id,
        friend_id: current_user_id,
        status: 'pending'
      }
    })
    if (!apply) {
      return ctx.throw(400, "该记录不存在")
    }

    let {
      status,
      nickname,
      lookme,
      lookhim
    } = ctx.request.body;
    let transaction;
    try {
      // 开启事务
      transaction = await app.model.transaction();
      /* 具体操作 */

      // 设置该申请状态
      await apply.update({
        status
      }, {
        transaction
      })
      // 同意的情况下 添加到好友列表中
      if (status === 'agree') {
        // 加入到对方还有列表
        // if (!await app.model.Friend.findOne({
        //     where: {
        //       friend_id: current_user_id,
        //       user_id: apply.user_id
        //     }
        //   })) {

        // }
        await app.model.Friend.create({
          friend_id: current_user_id,
          user_id: apply.user_id,
          nickname: apply.nickname,
          lookme: apply.lookme,
          lookhim: apply.lookhim
        }, {
          transaction
        })
        // 将对方加入到我的好友列表
        await app.model.Friend.create({
          friend_id: apply.user_id,
          user_id: current_user_id,
          nickname,
          lookme,
          lookhim
        }, {
          transaction
        })
        // if (!await app.model.Friend.findOne({
        //     friend_id: apply.user_id,
        //     user_id: current_user_id
        //   })) {

        // }
      }

      // 提交事务
      await transaction.commit();

      // 消息推送
      return ctx.apiSuccess('操作成功');
    } catch (e) {
      // 事务回滚
      await transaction.rollback();
      return ctx.apiFail('操作失败')
    }
  }
}

module.exports = ApplyController;