import {getConfig,isEmpty } from '../../utils/function'
import {Order} from '../../modal/Order'
const orderTabBar = getConfig('order.orderTabBar') || []
const ORDER_MAX_NUM = 5
let orderCount = 0
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
import {Address} from '../../modal/address'
import {Cart} from '../../modal/Cart'
const cartList = new Cart()
Page({

  /**
   * 页面的初始数据 
   */
  data: {
    orderTabBar,
    orderStatus:-1,
    order:[],
    hasMore:true,
    hasOrder:true,
    show:true
  },
  async getOrder(){
    if(!this.data.hasMore){
      wx.showToast({
        title: '已经到底了',
        icon:'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    const list = await Order.page(this.data.orderStatus,this.data.order.length,ORDER_MAX_NUM)
    console.log(list)
    wx.hideLoading()
    if(list.length ===0){
      this.setData({
        hasMore:false
      })
      return
    }
    const order = this.data.order.concat(list);
    console.log(order)
    let show;
    if(order.length>0){
      show = true
    }else{
      show = false
    }
    this.setData({
      order,
      show,
      hasMore:orderCount>ORDER_MAX_NUM
    })
  },
  async orderTab(e){
    console.log(e)
    const orderStatus = parseInt(e.detail.activeKey)
    this.setData({
      orderStatus,
      order:[],
      hasMore:true
    })
    orderCount = await Order.count(orderStatus)
      this.getOrder()
  },
  toList(){
    wx.switchTab({
      url: '/pages/list/list',
    })
  },
  async quickBuy(e){
    const orderId = e.currentTarget.dataset.orderId
    if(!orderId){
      return
    }
    let address = wx.getStorageSync(ADDRESS_STORE_NAME)
    let order = this.data.order.filter(item => item._id==orderId)
    order=order[0]
    if(order.length==0){
      return
    }
    if(isEmpty(address)){
      // 选择地址
     address = await Address.getDefaultAddressOrSelect()
     wx.setStorageSync(ADDRESS_STORE_NAME, address)
     console.log(address)
    }
    const data = []
    order.goods.forEach(item =>{
      data.push({
        goodsId:item.goods_id,
        goodsImg:item.goods_img,
        goodsName:item.goods_name,
        goodsPrice:item.goods_price,
        buyNumber:item.buyNumber,
        isQuick:true
      })
    })
    const res = await cartList.setCartAll(data)
    if(res){
      wx.navigateTo({
        url: "/pages/settlement/settlement?quick=1",
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    orderCount = await Order.count()
    this.setData({
      hasOrder:orderCount>0
    })
    // console.log(hasOrder)
   this.getOrder()
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