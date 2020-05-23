// miniprogram/pages/home/home.js
import {
  getConfig
} from '../../utils/function'
// import {Swiper} from '../../modal/Swiper'
import {
  Banner,
} from '../../storage/banner'
import {
  Swiper,
} from '../../storage/swiper'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[
     
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
  async initData (){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    const navList =await this.getNavigate()
    console
    const bannerList=await this.getbanner()
    const swiperList =await this.getRecommend()
    wx.hideLoading()
    this.setData({
      navList,
      bannerList,
      swiperList
    })
  },
  async getRecommend(){
    let swiperStorage = new Swiper();
    let swiperList = swiperStorage.getStorage();
    if(!swiperList){
      swiperList = await wx.cloud.callFunction({
        name : 'goods',
        data : {
          $url:'recommend',
          number:5
        }
      }).then(res=>res.result)
      swiperStorage.setStorage(swiperList)
    }
    return swiperList
  },
  getNavigate(){
    const navList =getConfig('navigate')
    // 赋值 setData;
    if(navList!=null){
      return navList
    }
  },
  async getbanner(){
    // Swiper.getSwiper().then(res => {
    //   console.log(res)
    // });
    
    // 获取云端数据
  // 判断是否有缓存
  const bannerStorage = new Banner();
  let bannerList = bannerStorage.getStorage();
  if(!bannerList){
    bannerList= await wx.cloud.callFunction({
      name :"getSwiper", 
    }).then(res => {
      return res.result.map(item => item.img);
    })
    bannerStorage.setStorage(swiper,2)
  }
   return bannerList 
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