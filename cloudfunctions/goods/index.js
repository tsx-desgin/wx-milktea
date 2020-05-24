// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 创建数据库
const db = cloud.database()
// 获取集合的引用。方法接受一个 name 参数，指定需引用的集合名称。
const goodsCollection = db.collection('goods');
const categoryCollection = db.collection('category');
const TcbRouter = require('tcb-router');
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });
  const number = event.number || 0;
  // filed 获取想要的参数,skip 从number开始
  app.router('recommend', async(ctx) =>{
    const list = await goodsCollection.where({
      is_recommend:1
    }).field({
      goods_id:true,
      cat_id:true,
      goods_img:true,
      goods_name:true,
      goods_price:true,
      stock:true,
      _id:false
    }).orderBy('cat_id','desc').limit(number).get().then(res=>res.data)
    ctx.body = list
  })

  // 获取商品分类
  app.router('category', async(ctx) =>{
    const parentId = parseInt(event.parent_id||0) 
    const category = await categoryCollection.where({
      parent_id:parentId
    }).field({
      _id:false,
      cat_id:true,
      cat_name:true,
      createTime:true,
    }).get().then(res=>res.data)
    ctx.body = category
  })
  return app.serve();
}