'use strict';
module.exports = app => {
  const {
    STRING,
    INTEGER,
    DATE,
    ENUM
  } = app.Sequelize;
  // 配置（重要：一定要配置详细，一定要！！！）
  const User = app.model.define('user', {
      id: {
        type: INTEGER(20).UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: '用户名称',
        unique: true
      },
      password: {
        type: STRING(200),
        allowNull: false,
        defaultValue: '',
        set(val){
          let hash = val + '123456'
          this.setDataValue('password',hash)
        }
      },
      avatar_url: {
        type: STRING(200),
        allowNull: true,
        defaultValue: ''
      },
      sex: {
        type: ENUM,
        values: ['男', '女', '保密'],
        allowNull: true,
        defaultValue: '男',
        comment: '用户性别'
      },
      created_at: {
        type:DATE,
        // 通过this.getDataValue('name') 获取原始数据
        get(){
          const val = this.getDataValue('created_at');
          return (new Date(val).getTime())
        }
      },
      updated_at: DATE,
      deleted_at: DATE
    }
    , {
      timestamps: true, // 是否自动写入时间戳
      tableName: 'user', // 自定义数据表名称
    }
  );

  return User;
};