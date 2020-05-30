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
const {isObject,isEmpty} = require('lodash');
const _ = db.command;

async function updateDefaultAddress(id,openid){
  const where = {
    _id:_.neq(id),
    isDefault:true,
    openid,
  }
  await addressCollection.where(where).update({
    data:{
      isDefault:false
    }
  })
}

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
  // 获取默认地址
  app.router('default', async(ctx)=>{
    const list = addressCollection.where({
      openid:ctx.openid
    }).orderBy('createTime','desc').get().then(res =>res.data)
    if(list.length===0){
      ctx.body = {}
    }else{
      const row = list.filter( item =>item.isDefault)
      if(row.length===0){
        ctx.body=list[0]
      }else{
        ctx.body = row[0]
      }
    }
  })
  app.router('add', async(ctx)=>{
    const address = event.address || {}
    if(!isObject(address)||isEmpty(address)){
      ctx.body={
        success:0,
        message:'参数错误'
      }
    }else{
      try {
        address.openid =ctx.openid;
        var res = await addressCollection.add({
          data:{
            ...address,
            openid:ctx.openid,
            createTime:db.serverDate()
          }
        })
      } catch (error) {
        console.log(error)
        ctx.body = {
          success:0,
          message:'添加失败'
        } 
      }
      // 如果当前是默认地址,把其他地址修改为非默认
      const curAddressId = res._id
      await updateDefaultAddress(curAddressId,ctx.openid)
      ctx.body = {
        success:1,
        addressId:curAddressId
      } 
    }
  })
  return app.serve()
}