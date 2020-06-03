// miniprogram/pages/settlement/settlement.js
import {getConfig,isEmpty} from '../../utils/function'
import {Cart} from '../../modal/Cart'
import {Coupon} from '../../modal/coupon'
const cartList = new Cart()
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{},
    cart:[]
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
    this.setData({
      address,
      cart
    })
  },
  async getCoupon(){
   const coupon = await Coupon.getCoupon()
   const userCoupon = await Coupon.getUserCoupon()
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
    wx.navigateTo({
      url: "/pages/address/address?from=list&settId="+settId,
    })
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