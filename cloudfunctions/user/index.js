// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const UserCollection = db.collection('user')
const TcbRouter = require('tcb-router');
const {isObject,isEmpty,uniq,random} = require('lodash');
const _ =db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });
  const {OPENID} = cloud.getWXContext()
  // 中间件
  app.use(async(ctx,next)=>{
    // 将openid添加到ctx中
    ctx.openid=OPENID;
    const user = await UserCollection.where({
      openid: OPENID
    }).get().then(res =>res.data)
    ctx.userId = user.length > 0 ? user[0]._id:''
    await next()
  })
  app.router('detail',async(ctx)=>{
    const user = await UserCollection.doc(ctx.userId).get().then(res => res.data)
    ctx.body = user
  })
  app.router('update', async(ctx) =>{
    const user = event.user
    const userId = event.userId
    if(isEmpty(user) || !userId){
      ctx.body = {
        success : '0',
        message:'参数错误'
      }
      return
    }
    try {
      const userInfo = await UserCollection.doc(userId).get().then(res => res.data)
      if(isEmpty(userInfo)){
        throw new Error('用户不存在')
      }
      const res = await UserCollection.doc(ctx.userId).update({
        data:user
      })
      console.log('res',res)
      if(res.stats.updated>0){
        if(user.avatarUrl && userInfo.avatarUrl){
          // console.log(1111)
          const act = await cloud.deleteFile({
            fileList: [userInfo.avatarUrl],
          })
          // console.log('act',act)
        }
      }else{
        throw new Error('没有修改数据')
      }
    } catch (error) {
      console.log('update-err',error)
      ctx.body = {
        success : '0',
        message:'修改失败'
      }
      return
    }
    ctx.body = {
      success:'1',
      message:'修改成功'
    }
  })
  return app.serve()
}