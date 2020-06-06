// miniprogram/pages/settlement/settlement.js
import {getConfig,isEmpty} from '../../utils/function'
import {Cart} from '../../modal/Cart'
import {Coupon} from '../../modal/coupon'
const cartList = new Cart()
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
import {Order} from '../../modal/Order'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{},
    cart:[],
    checkboxImg:{
      'default':'../../images/checkbox.png',
      'checked':'/images/checkbox@checked.png'
    },
    coupon:[],
    userCoupon:[],
    userSelectCouponId:0,
    orderTotal:0,
    actualPayment:0,
    couponMoney:0
  },
  chooseCoupon(e){
    console.log(e)
    const id = e.detail.key;
    const selected = e.detail.checked
    let userCoupon = this.data.userCoupon;
    const index = userCoupon.findIndex(item =>item._id ===id)
    const selectCoupon = userCoupon[index]
    if(selectCoupon.coupon.orderTotal>0 && this.data.orderTotal < selectCoupon.coupon.orderTotal){
      wx.showToast({
        title: '订单需要满'+selectCoupon.coupon.orderTotal+'元才能使用',
        icon:'none',
        mask:true
      })
      return
    }
    userCoupon = userCoupon.map(item =>{
      if(selected){
        item.selected =false
      }
      if(item._id === id){
        item.selected = selected
      }
      return item
    })
    let actualPayment,couponMoney
    if(selected){
      actualPayment = this.data.orderTotal - selectCoupon.coupon.money
      couponMoney = selectCoupon.coupon.money
    }else{
      actualPayment = this.data.orderTotal
      couponMoney = 0
    }
    console.log(actualPayment)
    this.setData({
      actualPayment,
      userCoupon,
      couponMoney
    })
  },
  async checkAuth (){
    const isLogin = await wx.getStorageSync(AUTH_LOGIN_KEY)
    if(isLogin != 1){
      // 跳转
      wx.switchTab({
        url: '/pages/home/home',
      })
      return
    }
    const address = wx.getStorageSync(ADDRESS_STORE_NAME) 
    if(isEmpty(address)){
      wx.showToast({
        title: '请选择地址',
        icon:"none"
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/list/list',
        })
      }, 1500);
      return
    }
    const cart = await cartList.getCart()
    if(cart.length===0){
        wx.showToast({
          title: '请选择商品',
          icon:"none"
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/list/list',
          })
        }, 1500);
        return
    }
    console.log(cart)
  
    const orderTotal = cart.reduce((item1,item2)=>{
      return item2.buyNumber * item2.goodsPrice
    },0)
    console.log(orderTotal)
    this.setData({
      address,
      cart,
      orderTotal,
      actualPayment:orderTotal
    })
  },
  async getCoupon(){
   const coupon = await Coupon.getCoupon()
   let userCoupon = await Coupon.getUserCoupon()
   userCoupon = userCoupon.map(item =>{
     item.selected = false
     return item
   })
   this.setData({
     coupon,
     userCoupon
   })
   console.log(coupon,userCoupon)
  },
  async reformGoods(){
    const cart = await cartList.getCart() 
    const goods = this.data.cart.map(item =>{
      item.buyNumber=0;
      // 根据购物车中的数据处理buyNumber
      const tmp = cart.filter(val =>val.goodsId==item.goodsId)
      if(tmp.length>0){
        item.buyNumber = tmp[0].buyNumber
      }
      return item
    })
  },
  async editCart(e){
    const goodsId = e.detail.goodsId;
    const type = e.detail.type;
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    if(type === 1){
      await this.addCart(goodsId)
    }else{
      await this.reduceCart(goodsId)
    }
    let userCoupon = this.data.userCoupon
    userCoupon = userCoupon.map(item => {
      item.selected = false
      return item
    })
    this.setData({
      userCoupon
    }) 
    wx.hideLoading()
  },
  async addCart(goodsId){
    console.log(this.data.cart)
    let goods = this.data.cart.filter(item =>item.goodsId===goodsId)
    let res;
    if(goods.length==0){
      wx.showToast({
        title: '没有找到此商品',
        icon:"none"
      })
      return
    }
    goods = goods[0];
    const cart =await cartList.getCart(goodsId)
    if(cart.length==0){
     wx.showToast({
       title: '请选择商品',
       icon:'none'
     })
     setTimeout(() => {
       wx.switchTab({
         url: '/pages/list/list',
       })
     }, 1500);
    }else{
      const buyNumber = cart[0].buyNumber+1
      res = await cartList.updateCartbuyNumber(goodsId,buyNumber);
    }
    if(res){
      wx.showToast({
        title: '添加成功',
      })
      this.reformGoods()
      this.checkAuth()
    }else{
      wx.showToast({
        title: '添加失败',
      })
    }
  },
  async reduceCart(goodsId){
    let goods = this.data.cart.filter(item =>item.goodsId===goodsId)
    if(goods.length==0){
      wx.showToast({
        title: '没有找到此商品',
        icon:"none"
      })
      return
    }
    goods = goods[0];
    const cart =await cartList.getCart(goodsId)
    if(cart.length==0){
      wx.showToast({
        title: '不能再减了~~~',
        icon:'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/list/list',
        })
      }, 1500);
      return
    }
    let res;
    if(cart[0].buyNumber==1){
      res = await cartList.removeCart(goodsId)
    }else{
      const buyNumber = cart[0].buyNumber-1
      res = await cartList.updateCartbuyNumber(goodsId,buyNumber);
    }
    if(res){
      wx.showToast({
        title: '操作成功',
      })
      this.reformGoods()
      this.checkAuth()
    }else{
      wx.showToast({
        title: '操作失败',
      })
    }
  },
  chooseAddress(){
    const random = ['0','1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j']
    let settId=""
    for(let i = 0;i<4;i++){
      settId+=random[parseInt(Math.random()*(random.length))]
    }
    wx.redirectTo({
      url: "/pages/address/address?from=list&settId="+settId,
    })
  },
  async orderSubmit(){
    if(isEmpty(this.data.address)){
      wx.showToast({
        title: '请选择地址',
        icon:'none',
        mask:true
      })
      return
    }
    if(this.data.cart.length === 0){
      wx.showToast({
        title: '请选择商品',
        icon:'none',
        mask:true
      })
      return
    }
    const goods = this.data.cart.map(item =>{
      return{
        goodsId : item.goodsId,
        buyNumber:item.buyNumber
      }
    })
    let userCouponId = this.data.userCoupon.filter(item => item.selected)
    if(userCouponId.length>0){
      userCouponId = userCouponId[0]._id
    }else{
      userCouponId = ''
    }
    wx.showLoading({
      title: '订单提交中',
      mask:true
    })
    const data={
      addressId:this.data.address._id,
      goods,
      userCouponId
    }
    const res = await Order.add(data)
    wx.hideLoading()
    if(res.success === 1){
      // 调起支付处理
      // wx.requestPayment({
      //   nonceStr: 'nonceStr',
      //   package: 'package',
      //   paySign: 'paySign',
      //   timeStamp: 'timeStamp',
      // })
      setTimeout(() => {
        wx.showToast({
          title: '提交成功',
          mask:true
        })
      }, 1500);
      wx.switchTab({
        url: '/pages/order/order',
      })
    }else{
      wx.showToast({
        title: res.message,
        icon:'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.checkAuth()
   this.getCoupon()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})