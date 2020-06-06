import {getConfig} from '../../utils/function'
import {Order} from '../../modal/Order'
const orderTabBar = getConfig('order.orderTabBar') || []
const ORDER_MAX_NUM = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderTabBar,
    orderStatus:-1,
    order:[],
    hasMore:true
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
    this.setData({
      order
    })
  },
  orderTab(e){
    console.log(e)
    const orderStatus = parseInt(e.detail.activeKey)
    this.setData({
      orderStatus,
      order:[],
      hasMore:true
    })
    this.getOrder()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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