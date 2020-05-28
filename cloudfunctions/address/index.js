// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 创建数据库
const db = cloud.database()
// 获取集合的引用。方法接受一个 name 参数，指定需引用的集合名称。
const addressCollection = db.collection('address');
const TcbRouter = require('tcb-router');

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });
  const {OPENID} = cloud.getWXContext()
  // 中间件
  app.use(async(ctx,next)=>{
    // 将openid添加到ctx中
    ctx.openid=OPENID;
    await next()
  })
  app.router('list', async(ctx)=>{
    const list = await addressCollection.where({
      openid:ctx.openid
    }).get().then(res => res.data)
    ctx.body = list
  })
  app.router('add', async(ctx)=>{
 
  })
  return app.serve()
}