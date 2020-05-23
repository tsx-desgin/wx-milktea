// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
axios.defaults.baseURL = 'http://api.2yue.cc/index.php/';
axios.defaults.timeout=10000;
axios.defaults.headers.appkey='f68bSYqte0m6EibwhARrzTcYDPoV0FobCi06uDfM3eF4QGQQKSywmd71ytM';
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 创建数据库
const db = cloud.database()
// 获取集合的引用。方法接受一个 name 参数，指定需引用的集合名称。
const SwiperCollection = db.collection('swiper');

// 云函数入口函数
exports.main = async (event, context) => {
  // 查询数据库里面的数据
  let res = await SwiperCollection.orderBy('createTime','desc').get().then(res => res.data)
  let isFetch = false;
  if(res.length==0){
    isFetch = true
  } else {
    const maxTime = new Date(res[0].createTime).getTime();
    if(Date.now()-maxTime>3600*1000*24){
      isFetch = true;
    }
  }
  if(isFetch){
    res = await axios.get('api/swiper').then(res => {
    res = res.data;
    if(res.error_code===0){
      return res.data
    }else{
      return [];
    }
  });
  if(res.length > 0){
    // 将数据插进数据库
    // db.serverDate  获取服务器的时间
    for(let key in res){
      const data = {
        ...res[key],
          createTime:db.serverDate()
      }
      const row = await SwiperCollection.where({
        id:res[key].id,
      }).get().then(res => res.data);
      if(row.length === 0){
        await SwiperCollection.add({
          data
        })
      }else {
        await SwiperCollection.where({
          id:res[key].id
        }).update({
          data
        })
      }
    }
  }
  }
  return res
}