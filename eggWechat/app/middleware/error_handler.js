module.exports = (option, app) => {
  return async function errorHandler(ctx, next) {
    try {
      await next();

      if (ctx.status === 404 && !ctx.body) {
        ctx.body = {
          msg: "fail",
          data: '404 错误'
        }
      }

    } catch (err) {

      // 记录一条错误日志
      app.emit('error', err, ctx);

      let status = err.status || 500
      //生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含一些敏感信息
      let error = status === 500 && app.config.env === 'prod' ? 'Internal Server Error' : err.message;


      // 参数验证异常
      if (err.message === 'Validation Failed') {
        if(err.errors && Array.isArray(err.errors)){
          status = 422
          error = err.errors[0].err[0] ? err.errors[0].err[0] : err.errors[0].err[1]
        }
        ctx.status = status
        return ctx.body = {
          msg: "fail",
          data: error
        }
      }

      // 错误提示
      ctx.body = {
        msg: "fail",
        data: error
      }
      ctx.status = status
    }
  }
};