// 抛出错误异常 中间件
module.exports = (option,app) => {
  return async function errorHandler(ctx, next) {
    try {
      await next()
    } catch (error) {

      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      ctx.app.emit('error', error, ctx);

      // const status = err.status || 500;
      // // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      // const error = status === 500 && ctx.app.config.env === 'prod' ?
      //   'Internal Server Error' :
      //   err.message;

      ctx.status = error.status;

      if(ctx.status === 422){
        return ctx.body = {
          msg:'fail',
          data:error.errors
        }
      }

      ctx.body = {
        msg: 'fail',
        data: error.message
      }
    }
  }
}