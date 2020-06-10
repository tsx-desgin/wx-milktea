class Storage {
  constructor (key,hasExpire = true) {
    if(key == null){
      throw new Error('key不能为空')
    }
    this.key = key
    this.hasExpire = true;
  }
  /*
     @description 设置缓存
     @params data[any] 缓存数据
     @params expire_time[int] 缓存时间 单位是小时 
  */ 
  setStorage (data,expire_time = 0) {
    expire_time = parseInt(expire_time);
    let result = data;
    if(this.hasExpire){
      if(isNaN(expire_time) || expire_time <=0){
        expire_time = Date.now()+24*3600*1000;
      } else{
        expire_time = Date.now()+expire_time*3600*1000;
      }
      result = {
        data,
        expire_time,
      }
    }
    console.log(result)
    wx.setStorageSync(this.key, result)
  }
  getStorage () {
    let result = wx.getStorageSync(this.key)
    if(!result){
      return result;
    }
    if(this.hasExpire){
      if(result.expire_time<Date.now()){
        result='';
        this.deleteStorage()
      }else{
        result = result.data
      }
    }
    return result;
  }
  deleteStorage(){
    wx.removeStorageSync(this.key)
  }
  static clearStorage(){
    wx.clearStorageSync()
  }
}
export {
  Storage
}