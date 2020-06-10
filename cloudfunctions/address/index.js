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
const ADDRESS_NUM_MAX = 5
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
    const list = await addressCollection.where({
      openid:ctx.openid
    }).orderBy('createTime','desc').get().then(res =>res.data)
    if(list.length===0){
      ctx.body = {}
    }else{
      // console.log(list)
      const row = list.filter( item =>item.isDefault)
      if(row.length===0){
        // console.log('list',list[0])
        ctx.body=list[0]
      }else{
        // console.log('row',row[0])
        ctx.body = row[0]
      }
    }
  })

  app.router('one', async(ctx)=>{
    const id = event.id || '';
    if(!id){
      ctx.body = {
        success:0,
        message:'参数错误'
      }
    }else{
      try {
        const row = await addressCollection.doc(id).get().then(res => res.data)
        ctx.body = {
          success:1,
          data:!!Object.keys(row).length?row : {}
        }
      } catch (error) {
        console.log('参数错误')
        ctx.body = {
          success:0,
          message:'查询失败'
        }
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
        // 获取address的数量
        const count = await addressCollection.where({
          openid:ctx.openid
        }).count().then(res =>res.data)
        if(count > ADDRESS_NUM_MAX){
          ctx.body={
            success:0,
            message:'最多保存'+ADDRESS_NUM_MAX+'条地址'
          }
        }else{
          var res = await addressCollection.add({
            data:{
              ...address,
              openid:ctx.openid,
              createTime:db.serverDate()
            }
          })
        }
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
  app.router('update', async(ctx)=>{
    const address = event.address || {}
    const id = event.id || ''
    if(!isObject(address)||isEmpty(address) || !id){
      ctx.body={
        success:0,
        message:'参数错误'
      }
    }else{
      try {
        address.openid =ctx.openid;
        const row =await addressCollection.where({
          _id:id,
          openid:ctx.openid
        }).get().then(res => res.data)
        if(row.length==0){
          ctx.body={
            success:0,
            message:'不允许修改'
          }
        }else{
          var res = await addressCollection.doc(id).update({
            data:{
              ...address,
              createTime:db.serverDate()
            }
          })
        }
      } catch (error) {
        console.log(error)
        ctx.body = {
          success:0,
          message:'修改失败'
        } 
      }
      // 如果当前是默认地址,把其他地址修改为非默认
      const curAddressId = res._id
      await updateDefaultAddress(id,ctx.openid)
      ctx.body = {
        success:1,
      } 
    }
  })
  app.router('delete' , async(ctx)=>{
    const id = event.id;
    if(!id){
      ctx.body = {
        success:0,
        message:'参数错误'
      }
      return 
    }
    try {
      const row =await addressCollection.where({
        _id:id,
        openid:ctx.openid
      }).get().then(res => res.data)
      if(row.length==0){
        ctx.body={
          success:0,
          message:'不允许删除'
        }
        return
      }
      await addressCollection.doc(id).remove()
    } catch (error) {
      console.log('delete-err',error)
      ctx.body = {
        success:0,
        message:'删除失败'
      }
    }
    ctx.body = {
      success:1,
      message:'删除成功'
    }
  })
  return app.serve()
}