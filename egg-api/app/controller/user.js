'use strict';

const Controller = require('egg').Controller;
// 虚拟数据
// var demo = [{
//     id: 1,
//     username: '用户名1',
//     nickname: '昵称',
//     sex: '男'
//   },
//   {
//     id: 2,
//     username: '用户名2',
//     nickname: '昵称',
//     sex: '男'
//   },
//   {
//     id: 3,
//     username: '用户名3',
//     nickname: '昵称',
//     sex: '男'
//   },
//   {
//     id: 4,
//     username: '用户名4',
//     nickname: '昵称',
//     sex: '男'
//   },
//   {
//     id: 5,
//     username: '用户名5',
//     nickname: '昵称',
//     sex: '男'
//   },
//   {
//     id: 6,
//     username: '用户名5',
//     nickname: '昵称',
//     sex: '男'
//   },
// ]

class UserController extends Controller {
  // 用户列表
  async index() {
    // 获取数据
    let result = []
    let page = this.ctx.query.page ? parseInt(this.ctx.query.page) : 1;
    let limit = 5;
    // 计算分页便宜量
    let offset = (page - 1) * 5
    // 查询多个
    let Op = this.app.Sequelize.Op

    //验证用户登录状态 
    // this.ctx.throw('500','故意出错');

    result = await this.app.model.User.findAll({
      where: {
        // sex: '男',
        // 模糊查询 like
        // % 表示是否有其他的参数
        // username: {
        //   [Op.like]: '%用户%',
        // },
        // id: {
        //   [Op.gt]: 4
        // }
      },
      //限制查询字段
      // 选中
      // attributes:['id','username','sex']
      // 排除 
      attributes: {
        exclude: ['password']
      },
      // 排序 会按照数组中的index分先后 
      // 降序：DESC 升序：ASC
      order: [
        ['updated_at', 'DESC'],
        ['id', 'DESC'],
      ],
      offset,
      limit
    });
    // 查询多个并统计
    // result = await this.app.model.User.findAndCountAll()

    // 获取url的问号get传值的参数
    // this.ctx.query.page;
    // this.ctx.query.status;
    // 响应
    this.ctx.body = {
      msg: 'ok',
      data: result
    }
    // 修改状态码
    // this.ctx.status = 201
  }

  // 读取某个用户数据
  async read() {
    let id = parseInt(this.ctx.params.id);
    // let detail = demo.find(item => item.id == id)
    // 通过主键查询单个数据
    // let detail = await this.app.model.User.findByPk(id)
    // if(!detail){
    //   return this.ctx.body = {
    //     msg:'fail',
    //     data:'用户不存在'
    //   }
    // }
    // 查询一个

    //验证用户登录状态 
    // this.ctx.throw('500','故意出错');

    let detail = await this.app.model.User.findOne({
      where: {
        id,
        sex: '女'
      }
    })
    this.ctx.body = {
      msg: 'ok',
      data: detail
    }
  }

  // 创建用户
  async create() {
    // 参数验证
    // 写入数据库

    //验证用户登录状态 
    // this.ctx.throw('500','故意出错');

    let params = this.ctx.request.body;
    this.ctx.validate({
      username: {
        type: 'string',
        required: true,//是否必填
        desc: '用户名'
      },
      password: {
        type: 'string',
        required: true,
        desc: '密码'
      },
      sex: {
        type: 'string',
        required: false,
        defValue:'保密',
        desc: '性别'
      }
    });
    // 参数验证

    // 新增单个
    let res = await this.app.model.User.create(params)

    // 批量新增
    // let res = await this.app.model.User.bulkCreate([{
    //     username: '测试1',
    //     password: '密码1',
    //     sex: '男'
    //   },
    //   {
    //     username: '测试2',
    //     password: '密码2',
    //     sex: '男'
    //   },
    //   {
    //     username: '测试3',
    //     password: '密码3',
    //     sex: '男'
    //   },
    //   {
    //     username: '测试4',
    //     password: '密码4',
    //     sex: '男'
    //   },
    //   {
    //     username: '测试5',
    //     password: '密码5',
    //     sex: '男'
    //   },
    //   {
    //     username: '测试6',
    //     password: '密码6',
    //     sex: '男'
    //   },
    // ])

    // 成功
    return this.ctx.body = res
  }

  // 修改用户
  async update() {
    let id = this.ctx.params.id ? parseInt(this.ctx.params.id) : -1;
    // 拿到这条记录
    let data = await this.app.model.User.findByPk(id);
    if (!data) {
      return this.ctx.body = {
        msg: 'fail',
        data: '该记录不存在！'
      }
    }
    // data.username = '被修改了1'
    // data.sex='男'
    // let res = await data.save(
    //   {
    //  // 当存在不希望被修改的字段 添加可被修改的字段的名称
    //   fields:['username']
    //   }
    // );

    let params = await this.ctx.request.body;
    let res = await data.update(params, {
      // 限制当前表可修改的数据
      fields: ['username']
    });

    this.ctx.body = {
      msg: 'ok',
      data: res
    }
  }

  // 删除用户
  async destroy() {
    // 删除单个
    // let id = this.ctx.params.id ? parseInt(this.ctx.params.id) : -1;
    // let data = await this.app.model.User.findByPk(id)
    // if(!data){
    //   return this.ctx.body = {
    //     msg:'fail',
    //     data:'该记录不存在'
    //   }
    // }

    // let res = await data.destroy()
    // this.ctx.body = {
    //   msg:'ok',
    //   data:res
    // }

    // 批量删除
    let Op = this.app.model.Sequelize.Op;
    let res = await this.app.model.User.destroy({
      where: {
        id: {
          [Op.lte]: 3
        }
      }
    })
    this.ctx.body = {
      msg: 'ok',
      data: res
    }
  }

}

module.exports = UserController;