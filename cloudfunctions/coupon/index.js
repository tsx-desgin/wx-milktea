// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 创建数据库
const db = cloud.database()
const couponCollection = db.collection('coupon');
const userCouponCollection = db.collection('user_coupon');
const UserCollection = db.collection('user')
const TcbRouter = require('tcb-router');
const {isObject,isEmpty,uniq} = require('lodash');
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
  // 获得优惠券信息
  app.router('get-coupon', async (ctx) =>{
    const now = db.serverDate()
    let list = []
    try {
      list = await couponCollection.where({
        expire:_.gt(now)
      }).get().then(res =>res.data)
    } catch (error) {
      console.log('get-coupon',error)
    }
    ctx.body= list
  })
  app.router('get-user-coupon', async (ctx) =>{
    if(!ctx.userId){
      ctx.body = []
      return
    }
    const now = db.serverDate()
    let list = []
    try {
      list = await userCouponCollection.where({
        userId:ctx.userId,
        isUser:false,
        expire:_.gt(now)
      }).get().then(res =>res.data)
      let couponIds = list.map(item => item.couponId)
      // 去重
      couponIds = uniq(couponIds)
      const coupon = await couponCollection.where({
        _id:_.in(couponIds)
      }).field({
        money:true,
        orderTotal:true
      }).get().then(res => res.data)
      list = list.map(item =>{
        item.coupon={}
        const index = coupon.findIndex(val => val._id == item.couponId)
        if(index > -1){
          // 删除数组中的key
          // delete coupon[index]._id
          Reflect.deleteProperty(coupon[index],'_id')
          item.coupon = coupon[index]
        }
        // const result = {...item,...coupon[index]}
        return item
      })
      ctx.body =list
    } catch (error) {
      console.log('get-user-coupon',error)
    }
  })
  // 获取用户优惠券
  return app.serve()
}