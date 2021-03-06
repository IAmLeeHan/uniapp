// app/model/user.js
'use strict';
// 加密方法
const crypto = require('crypto');
module.exports = app => {
  const {
    STRING,
    INTEGER,
    DATE,
    ENUM,
    TEXT
  } = app.Sequelize;
  // 配置（重要：一定要配置详细，一定要！！！）
  const Apply = app.model.define('apply', {
    id: {
      type: INTEGER(20).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: INTEGER(20).UNSIGNED,
      allowNull: false,
      comment: '申请人id',
      //  定义外键（重要）
      references: {
        model: 'user', // 对应表名称（数据表名称）
        key: 'id' // 对应表的主键
      },
      onUpdate: 'restrict', // 更新时操作
      onDelete: 'cascade' // 删除时操作
    },
    friend_id: {
      type: INTEGER(20).UNSIGNED,
      allowNull: false,
      comment: '好友id',
      //  定义外键（重要）
      references: {
        model: 'user', // 对应表名称（数据表名称）
        key: 'id' // 对应表的主键
      },
      onUpdate: 'restrict', // 更新时操作
      onDelete: 'cascade' // 删除时操作
    },
    nickname: {
      type: STRING(30),
      allowNull: false,
      defaultValue: '',
      comment: '备注',
    },
    lookme: {
      type: INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      comment: '看我'
    },
    lookhim: {
      type: INTEGER(1),
      allowNull: false,
      defaultValue: 1,
      comment: '看他'
    },
    status: {
      type: ENUM,
      values: ['pending', 'refuse', 'agree', 'ignore'],
      allowNull: false,
      defaultValue: 'pending',
      comment: '申请状态'
    },
    created_at: DATE,
    updated_at: DATE
  });

  // 模型关联
  Apply.associate = function(model){
    // 反向一对多
    Apply.belongsTo(app.model.User,{
      // 关联外键  默认是：表名_id 所以可以不用写
      foreignKey:'user_id'
    })
  }

  return Apply;
};