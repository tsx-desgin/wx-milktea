// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 创建数据库
const db = cloud.database()
const orderCollection = db.collection('order');
const addressCollection = db.collection('address');
const goodsCollection = db.collection('goods');
const UserCollection = db.collection('user')
const couponCollection = db.collection('coupon');
const userCouponCollection = db.collection('user_coupon');
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
 app.router('add' , async(ctx)=>{
   const addressId = event.addressId || '';
   const goods = event.goods || [];
   const userCouponId = event.userCouponId || ''
   if(!addressId || goods.length == 0){
     ctx.body = {
       success : 0,
       message : '参数错误'
     }
     return
   }
   try {
    let address = await addressCollection.where({
      _id:addressId,
      openid:ctx.openid
    }).get().then( res => res.data)
    if(isEmpty(address)){
      ctx.body = {
        success : 0,
        message : '地址不存在'
      }
      return
    }
    const goodsIds = goods.map(item => item.goodsId)
    const buyGoods = await goodsCollection.where({
      goods_id : _.in(goodsIds)
    }).field({
      goods_id:true,
      goods_img:true,
      goods_name:true,
      goods_price:true,
      stock:true,
      _id:false
    }).get().then(res => res.data)
    var orderTotal = 0;
    var orderGoods = [];
    for(let i in goods){
      const item = goods[i]
      let row = buyGoods.filter(val => val.goods_id===item.goodsId)
      if(row.length === 0){
        ctx.body = {
          success :0,
          message : 'ID为'+item.goodsId+'的商品未找到'
        }
        return
      }
      row = row[0]
      if(item.buyNumber > row.stock){
        ctx.body = {
          success :0,
          message : ''+row.goods_name+'的库存不足'
        }
        return
      }
      orderTotal += item.buyNumber * row.goods_price
      orderGoods.push({
        ...row,
        buyNumber:item.buyNumber
      })
    }
    var couponMoney = 0
    if(userCouponId){
      const now = db.serverDate() 
      var userCoupon = await userCouponCollection.where({
        _id:userCouponId,
        userId:ctx.userId,
        isUser:false,
        expire:_.gt(now)
      }).get().then(res => res.data)
      if(userCoupon.length == 0){
        ctx.body = {
          success :0,
          message : '优惠券不存在'
        }
        return
      }
      userCoupon = userCoupon[0]
      const coupon = await couponCollection.doc(userCoupon.couponId).get().then(res => res.data)
      if(coupon.orderTotal > orderTotal){
        ctx.body = {
          success :0,
          message : '订单需满'+coupon.orderTotal+'元才可用'
        }
        return
      }
      couponMoney = coupon.money
    }
    address= address[0]
     //  组装订单数据
     const data = {
      consignee : address.name,
      phone : address.phone,
      address : address.region[0]+address.region[1]+address.region[2]+address.detail,
      orderTotal,
      actualPayment:orderTotal - couponMoney,
      couponMoney,
      status:0,
      createTime:db.serverDate(),
      goods:orderGoods
    }
    // 事务
    const result = await db.runTransaction(async transaction =>{
       const res = await transaction.collection('order').add({
         data
       })
       if(res._id){
          // 修改库存
          for(let i = 0;i<orderGoods.length;i++){
            const r1 = await transaction.collection('goods').where({
              goods_id : orderGoods[i].goods_id
            }).update({
              data:{
                // .inc 自增 自减
                stock : _.inc(-1*orderGoods[i].buyNumber)
              }
            })
            const r2 = await transaction.collection('cart').where({
              goodsId : orderGoods[i].goods_id,
              _openid:ctx.openid
            }).remove()
            if(!r1.stats.updated || !r2.stats.removed){
              // 会作为 runTransaction reject 的结果出去
              // 回滚
              await transaction.rollback()
            }
          }
          // 修改购物车数据
          return  {
            success : 0,
            message :'提交成功'
          }
         
        }else{
          return  {
            success : 0,
            message :'提交失败'
          }
        }
    }) 
    ctx.body = result
   } catch (error) {
     console.log('add-err',error)
     ctx.body = {
       success : 0,
       message :'提交失败'
     }
   }
 })
 return app.serve()
}