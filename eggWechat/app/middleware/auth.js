const { app } = require("egg-mock");

module.exports = (option,app) => {
  return async (ctx,next)=>{
    // 1、获取 header头token
    const {token } = ctx.header;
    if(!token){
      return ctx.apiFail('您没有权限访问接口')
    }
    // 2、解密 获取用户信息
    let user = {}
    try {
      user = ctx.checkToken(token)
    } catch (error) {
      let fail = error.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
      return ctx.throw(400,fail);
    }
    // 3、判断当前用户是否登录
    let t = await ctx.service.cache.get('user_'+user.id)
    if(!t || t !== token){
      return ctx.throw(400,"Token 令牌不合法!")
    }

    // 4、获取当前用户，验证是否被禁用
    user = await app.model.User.findByPk(user.id)
    if(!user || user.status === 0){
      return ctx.throw(400,"用户不存在或已被禁用")
    }
    
    // 5、把user信息挂载到全局ctx上
    ctx.authUser = user; 

    return await next()
  }
}