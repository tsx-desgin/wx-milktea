class Cart {
  constructor(){
    this.db = wx.cloud.database()
    this.collection = this.db.collection('cart')
  }
  async getCart(goodsId=0,quickBuy=0){
    const where = {};
    if(goodsId > 0){
      where.goodsId=goodsId
    }
    if(quickBuy>0){
      where.isQuick=true
    }
    const res = await this.collection.where(where).get().then(res =>res.data)
    return res
  }
  async setCart(data){
    if(data==null || Object.keys(data).length==0){
      return false
    }
    data.createTime = this.db.serverDate()
    try {
      await this.collection.add({
        data
      })  
    } catch (error) {
      console.log(error)
      return false
    }
    return true
  }
  async updateCartbuyNumber(goodsId,buyNumber){
    if(!goodsId || !buyNumber){
      return false
    }
    const row =await this.collection.where({
      goodsId
    }).get().then(res => res.data);
    if(row.length==0){
      return false
    }
    try {
      await this.collection.doc(row[0]._id).update({
        data:{
          buyNumber
        }
      })  
    } catch (error) {
      console.log(error)
      return false
    }
    return true
  }
  async removeCart(goodsId){
    if(!goodsId){
      return false
    }
    const row =await this.collection.where({
      goodsId
    }).get().then(res => res.data);
    if(row.length==0){
      return false
    }
    try {
      await this.collection.doc(row[0]._id).remove()  
    } catch (error) {
      console.log(error)
      return false
    }
    return true
  }
  async setCartAll(data){
    if(!Array.isArray(data)||data.length==0){
      return false
    }
   return await wx.cloud.callFunction({
     name:'order',
     data:{
       $url:'setCartAll',
       data
     }
   }).then(res=>res.result)
  }
  async removeQuickGoods(){
   return await wx.cloud.callFunction({
     name:'order',
     data:{
       $url:'removeQuickCart',
     }
   }).then(res =>res.result)
  }
}

export {
  Cart
}