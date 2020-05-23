// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
// axios.defaults.baseURL = 'http://api.2yue.cc/index.php/';
axios.defaults.timeout=20000;
axios.defaults.headers.appkey='f68bSYqte0m6EibwhARrzTcYDPoV0FobCi06uDfM3eF4QGQQKSywmd71ytM';
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 创建数据库
const db = cloud.database()
// 获取集合的引用。方法接受一个 name 参数，指定需引用的集合名称。
const goodsCollection = db.collection('goods');
const loadGoodsUrl = 'http://api.2yue.cc/index.php/api/goods_list2?type=1'
const loadGoodsTotalUrl = 'http://api.2yue.cc/index.php/api/goods_count?type=1'
// 云函数入口函数

async function loadGoods () {
  let count = 20;
  const total = await axios.get(loadGoodsTotalUrl).then(res =>{
    res = res.data;
    if(res.error_code===0){
      return res.data
    }else{
      return 0;
    }
  });
  let totalPage = Math.ceil(total/count);
  let resList;
  let list = [];
  for(let page = 1;page<=totalPage;page++){
    resList = await axios.get(loadGoodsUrl,{
      params : {
        page,
        count,
      }
    }).then(res =>{
      res = res.data;
      if(res.error_code===0){
        return res.data.goods;
      }else{
        return [];
      }
    });
    list = list.concat(resList)
  } 
  if(list.length > 0){
     // 将数据插进数据库
    // db.serverDate  获取服务器的时间
    for(let key in list){
      const data = {
        ...list[key],
          createTime:db.serverDate()
      }
      const row = await goodsCollection.where({
        goods_id:list[key].goods_id,
      }).get().then(res => res.data);
      if(row.length === 0){
        await goodsCollection.add({
          data
        })
      }else {
        await goodsCollection.where({
          goods_id:list[key].id
        }).update({
          data
        })
      }
    }
  } 
  console.log(list.length)
}
exports.main = async (event, context) => {
  await loadGoods()
}