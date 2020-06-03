import {Address} from '../../modal/address'
import {validate} from '../../utils/function'
import addressValidate from '../../validate/address'
import {getConfig,isEmpty} from '../../utils/function'
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
let navigateType = '';
let addressId = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    customItem: '全部',
    address:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    navigateType = options.from || ''
    addressId = options.id|| ''
  },
  getAddress(){
    if(!addressId){
      return
    }
    Address.getAddressById(addressId).then(res =>{
      if(!isEmpty(res)){
        this.setData({
          address:res,
          region:res.region,
        })
      }
      console.log(res)
    })
  },
  bindRegionChange(e){
    // console.log(e.detail.value)
    const detail = e.detail.value
    this.setData({
      region:detail
    })
  },
  async saveAddress(e){
    console.log(e)
    const data = e.detail.value;
    data.region = this.data.region
    const vali = validate(data,addressValidate)
    if(vali.error!==0){
      wx.showToast({
        title: vali.message,
        icon:'none'
      })
      return
    } 
    wx.showLoading({
      title: '提交中',
      mask:true
    })
    let res;
    if(addressId !==''){
      res = await Address.update(data,addressId)
    }else{
      res = await Address.add(data)
    }
    wx.hideLoading()
    console.log(res)
    if(res.success===1){
      data._id = res.addressId
      wx.setStorageSync(ADDRESS_STORE_NAME, data)
      wx.showToast({
        title: addressId!=''?'修改成功':'添加成功',
      })
      if(navigateType === 'list' &&addressId ===''){
        wx.switchTab({
          url: "/pages/list/list",
        })
      }else{
        console.log(navigateType)
        wx.redirectTo({
          url: '/pages/address/address?from='+navigateType,
        })
      }
    }else{
      wx.showToast({
        title: res.message,
        icon:'none'
      })
    }
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
    this.getAddress()
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