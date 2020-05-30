// miniprogram/pages/list/list.js
import {Category} from '../../storage/category'
import {Cart} from '../../modal/Cart'
import {Address} from '../../modal/address'
const CartModel = new Cart();
const MAX_FETCH_NUM = 6
let promotion = [{cat_id : -1,cat_name : '热销'},{cat_id : -2,cat_name : '优惠'}]
let catId = -1
import {getConfig} from '../../utils/function'
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{
    },
    categoryList:[],
    goods:[],
    bodyHeight:0,
    rightTitle:'',
    hasMore:true,
    cart:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const isLogin = await wx.getStorageSync(AUTH_LOGIN_KEY)
    if(isLogin != 1){
      // 跳转
      wx.switchTab({
        url: '/pages/home/home',
      })
      return
    }
    this.initData()
    console.log('onLoad')
  },
  async initData(){
    wx.showLoading({
      title: '加载中',
    })
    const categoryList = await this.getCategory()
    console.log(categoryList)
    wx.hideLoading()
    this.setData({
      categoryList,
    })
    await this.getTitle()
    await this.getGoodsList()
    // 获取窗口的高度
    wx.getSystemInfo({//获取系统信息
      success: (res) => {
        console.log(res)
        // 获取dom节点操作
        const query = wx.createSelectorQuery()
        // 获取单个节点的操作
        query.select('#address').boundingClientRect(result=>{
          console.log(res.windowHeight-result.height)
          this.setData({
            bodyHeight:res.windowHeight-result.height
          })
        }).exec()
        // 可以用来获取多个dom节点操作信息
        // query.exec(result=>{
        //   console.log(result)
        // })
      },
    })
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
    if(!this.data.hasMore){
      wx.showToast({
        title: '亲,已经到底了哦~',
        icon:"none"
      })
      return
    }
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
    // console.log(list)
    if(list.length>0){
      let goods = this.data.goods.concat(list);
      this.setData({
        goods
      })
      this.reformGoods()
    }else{
      this.setData({
        hasMore:false
      })
    }
  },
  // 重组goods
  async reformGoods(){
    const cart = await CartModel.getCart() 
    const goods = this.data.goods.map(item =>{
      item.buyNumber=0;
      // 根据购物车中的数据处理buyNumber
      const tmp = cart.filter(val =>val.goodsId==item.goods_id)
      if(tmp.length>0){
        item.buyNumber = tmp[0].buyNumber
      }
      return item
    })
    this.setData({
      goods,
      cart
    })
  },
  getTitle(){
    const index =this.data.categoryList.findIndex(item =>item.cat_id==catId)
    const rightTitle = this.data.categoryList[index].cat_name
    this.setData({
      rightTitle
    })
  },
  chageCategory(e){
    catId = e.detail.catId;
    this.getTitle()
    this.setData({
      goods:[],
      hasMore:true
    })
   this.getGoodsList()
  },
  loadMore(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    this.getGoodsList()
    wx.hideLoading()
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
    let goods = this.data.goods.filter(item =>item.goods_id===goodsId)
    let res;
    if(goods.length==0){
      wx.showToast({
        title: '没有找到此商品',
        icon:"none"
      })
      return
    }
    goods = goods[0];
    const cart =await CartModel.getCart(goodsId)
    if(cart.length==0){
      const data = {
        goodsId:goods.goods_id,
        goodsName:goods.goods_name,
        goodsImg:goods.goods_img,
        goodsPrice:goods.goods_price,
        buyNumber:1,
      }
      res =await CartModel.setCart(data)
    }else{
      const buyNumber = cart[0].buyNumber+1
      res = await CartModel.updateCartbuyNumber(goodsId,buyNumber);
    }
    if(res){
      wx.showToast({
        title: '添加成功',
      })
      this.reformGoods()
    }else{
      wx.showToast({
        title: '添加失败',
      })
    }
  },
  async reduceCart(goodsId){
    let goods = this.data.goods.filter(item =>item.goods_id===goodsId)
    if(goods.length==0){
      wx.showToast({
        title: '没有找到此商品',
        icon:"none"
      })
      return
    }
    goods = goods[0];
    const cart =await CartModel.getCart(goodsId)
    if(cart.length==0){
      wx.showToast({
        title: '不能再减了~~~',
        icon:'none'
      })
      return
    }
    let res;
    if(cart[0].buyNumber==1){
      res = await CartModel.removeCart(goodsId)
    }else{
      const buyNumber = cart[0].buyNumber-1
      res = await CartModel.updateCartbuyNumber(goodsId,buyNumber);
    }
    if(res){
      wx.showToast({
        title: '操作成功',
      })
      this.reformGoods()
    }else{
      wx.showToast({
        title: '操作失败',
      })
    }
  },
  // 获取地址信息
  async getAddress(){
    const address = await Address.getDefaultAddressOrSelect();
    console.log(address)
  },
  // 提交订单
  submit(){
    // 判断是否登录
    // 判断是否选择地址
    // 判断购物车是否为空
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAddress()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload')
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