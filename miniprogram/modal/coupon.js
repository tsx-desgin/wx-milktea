class Coupon {
  static async getCoupon () {
    // 获取优惠活动
    return await wx.cloud.callFunction({
      name : 'coupon',
      data:{
        $url:'get-coupon'
      }
    }).then(res =>res.result)
  }
  static async getUserCoupon() {
    return await wx.cloud.callFunction({
      name : 'coupon',
      data:{
        $url:'get-user-coupon'
      }
    }).then(res =>res.result)
  }
}

export {
  Coupon
}