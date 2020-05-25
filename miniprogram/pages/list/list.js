// miniprogram/pages/list/list.js
import {Category} from '../../storage/category'
const MAX_FETCH_NUM = 6
let promotion = [{cat_id : -1,cat_name : '热销'},{cat_id : -2,cat_name : '优惠'}]
let catId = -1
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{
      name:'谭绍祥',
      phone:17358829937,
      detail:'湖南长沙'
    },
    categoryList:[],
    goods:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
  },
  async initData(){
    wx.showLoading({
      title: '加载中',
    })
    const categoryList = await this.getCategory()
    wx.hideLoading()
    this.setData({
      categoryList,
    })
    await this.getGoodsList()
  },
  async getCategory(){
    // 在小程序端访问数据库，需要将权限改为所有用户可读
  //   const db = wx.cloud.database();
  //   let res = await db.collection('category').where({
  //     parent_id:0
  //   }).get().then(res=>res.data)
  //   console.log(res)
    const category = new Category()
    let CategoryList = category.getStorage()    
    if(!CategoryList){
      CategoryList = await  wx.cloud.callFunction({
        name:'goods',
        data:{
          $url:'category',
        }
      }).then(res=>res.result)
      console.log(CategoryList)
      category.setStorage(CategoryList)
    } 
    CategoryList = promotion.concat(CategoryList)
    return CategoryList
  },

  async getGoodsList(){
    const data = {
      $url:'list',
      number:MAX_FETCH_NUM,
      offset:this.data.goods.length,
    }
    if(catId == -1){
      data.isRecomend = 1
    }else if(catId == -2){
      data.isSales = 1
    }else if(catId>0){
      data.pid = catId;
    }
    const list = await wx.cloud.callFunction({
      name:'goods',
      data
    }).then(res=>res.result)
    console.log(list)
    if(list.length>0){
      const goods = this.data.goods.concat(list);
      this.setData({
        goods
      })
    }else{
      wx.showToast({
        title: '亲,已经到底了哦~',
        icon:"none"
      })
    }

  },
  chageCategory(e){
    catId = e.detail.catId;
    this.setData({
      goods:[]
    })
   this.getGoodsList()
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