'use strict';
const crypto = require('crypto');
const Controller = require('egg').Controller;

class UserController extends Controller {
  // 注册
  async reg() {
    let {
      ctx,
      app
    } = this;
    // 参数验证
    // 前端传过来的不存在的参数 在validate中已经做了过滤 
    ctx.validate({
      username: {
        type: 'string',
        required: true, //是否必填
        range: {
          min: 6,
          max: 20
        },
        desc: '用户名'
      },
      password: {
        type: 'string',
        required: true,
        desc: '密码'
      },
      repassword: {
        type: 'string',
        required: true,
        desc: '确认密码'
      }
    }, {
      equals: [
        ['password', 'repassword']
      ]
    });
    let {
      username,
      password
    } = ctx.request.body;
    // 验证用户是否已经存在
    if (await app.model.User.findOne({
        where: {
          username
        }
      })) {
      ctx.throw(400, "用户名已存在")
    }
    // 创建用户
    let user = await app.model.User.create({
      username,
      password
    });
    if (!user) {
      ctx.throw(400, '创建用户失败')
    }
    ctx.apiSuccess(user);
  }

  // 登录
  async login() {
    const {
      ctx,
      app
    } = this;
    // 参数验证
     ctx.validate({
      username: {
        type: 'string',
        required: true, //是否必填
        desc: '用户名'
      },
      password: {
        type: 'string',
        required: true,
        desc: '密码'
      }
    });
    let {
      username,
      password
    } = ctx.request.body;
    // 验证该用户是否存在
    let user = await app.model.User.findOne({
      where: {
        username,
        // 验证该用户状态是否启用
        status: 1
      }
    })
    if (!user) {
      return ctx.throw(400, "用户不存在或被禁用")
    }
    // 验证密码
    await this.checkPassword(password,user.password)
    // 生成token
    user = JSON.parse(JSON.stringify(user))
    let token = ctx.getToken(user)
    user.token = token;
    delete user.password
    // 加入到缓存中
    if(!await this.service.cache.set('user_'+user.id,token)){
      return ctx.throw(400,"登录失败")
    }
    // 返回用户信息和token
    return ctx.apiSuccess(user)
  }

  //验证密码的方法
  async checkPassword(password, hash_password) {
    // 先对需要验证的密码进行加密
    const hmac = crypto.createHash("sha256", this.app.config.crypto.secret);
    hmac.update(password);
    password = hmac.digest("hex");
    let res = password === hash_password;
    if(!res){
      return this.ctx.throw(400,"密码错误")
    }
    return true
  }

  // 退出登录
  async logout(){
    const {ctx,service} = this;
    // 获取当前用户id
    let current_user_id = ctx.authUser.id;
    // 移除当前用户redis信息
    if(!await service.cache.remove('user_' + current_user_id)){
      return ctx.throw(400,"退出登录失败")
    }
    return ctx.apiSuccess("退出成功")
  }

}

module.exports = UserController;