class Order {
  static async add (data) {
    return await wx.cloud.callFunction({
      name:'order',
      data:{
        $url:'add',
        ...data
      }
    }).then(res => res.result)
  }
  static async page (status,start,count) {
    return await wx.cloud.callFunction({
      name:'order',
      data:{
        $url:'list',
        status,
        start,
        count
      }
    }).then(res =>res.result)
  }
}

export {
  Order
}