// miniprogram/pages/home/home.js
import {
  getConfig
} from '../../utils/function'
// import {Swiper} from '../../modal/Swiper'
import {
  Banner
} from '../../storage/banner'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[
      "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1589955260578&di=8b07c7624a94955651eab32554071ff5&imgtype=0&src=http%3A%2F%2Fimg2.imgtn.bdimg.com%2Fit%2Fu%3D3984473917%2C238095211%26fm%3D214%26gp%3D0.jpg",
      "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1589951844055&di=f52d6521a8818519152d7d4ef4783a11&imgtype=0&src=http%3A%2F%2Fa4.att.hudong.com%2F52%2F52%2F01200000169026136208529565374.jpg"
    ],
    navList:[],
    bannerList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
  },
  initData (){
    this.getNavigate()
    this.getSwiper()
  },
  getNavigate(){
    const navigate =getConfig('navigate')
    // 赋值 setData;
    if(navigate!=null){
      this.setData({
        navList:navigate,
      })
    }
  },
  async getSwiper(){
    // Swiper.getSwiper().then(res => {
    //   console.log(res)
    // });
    
    // 获取云端数据
  // 判断是否有缓存
  const bannerStorage = new Banner();
  const bannerList = bannerStorage.getStorage();
  if(bannerList){
    this.setData({
      bannerList
    })
    return
  }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    const swiper = await wx.cloud.callFunction({
      name :"getSwiper", 
    }).then(res => {
      return res.result.map(item => item.img);
    })
    console.log(swiper)
    wx.hideLoading()
    // 保存缓存
    bannerStorage.setStorage(swiper,2)
    this.setData({
      bannerList:swiper
    })
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