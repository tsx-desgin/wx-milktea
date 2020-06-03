let navigateType = '';
const MAX_ADDRESS_NUM = 5
import {Address} from '../../modal/address'
import {getConfig,isEmpty} from '../../utils/function'
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showBtn:true,
    address:[],
    slideButtons:[{src:'/images/icon/edit.png'},{src:'/images/icon/del.png'}]
  },
  async getAddressList(){
    let address = await Address.getAddress()
    if(navigateType === 'list'){
      const storageAddress = wx.getStorageSync(ADDRESS_STORE_NAME);
      address = address.map(item => {
        item.selected = false;
        if(!isEmpty(storageAddress) && item._id ===storageAddress._id){
          item.selected = true
        }
        return item
      })
      const index = address.findIndex(item => item.selected);
      let selectAddress;
      if(index>-1){
        selectAddress = address[index];
        address.splice(index,1)
        address.unshift(selectAddress)
      }
    }
    const showBtn = address.length < MAX_ADDRESS_NUM
    this.setData({
      showBtn,
      address,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    navigateType = options.from || ''
    const navigateTitle = navigateType ==='list' ? '选择地址' : '我的地址' 
    // 设置title
    wx.setNavigationBarTitle({
      title: navigateTitle,
    })
    console.log(options)
    this.getAddressList()
  },
  toAddAddress(){
    wx.navigateTo({
      url: '/pages/address-add/address-add?from='+navigateType,
    })
  },
  slideButtonTap(e) {
    const index = e.detail.index;
    const id = e.currentTarget.dataset.id;
    if(index===0){//修改地址
      wx.navigateTo({
        url: '/pages/address-add/address-add?id='+id+'&from='+navigateType,
      })
    }else{//删除地址
      this.deleteAddress(id)
    }
    console.log('slide button tap', e.detail)
  },
  deleteAddress(id){
    if(!id){
      return
    }
    wx.showModal({
      title:'提示',
      content:'确认要删除吗?',
      success: res =>{
        if(res.confirm){
          wx.showLoading({
            title: '删除中',
            mask:true
          })
          Address.deleteAddress(id).then(res => {
            if(res.success==1){
              wx.showToast({
                title: '删除成功',
              })
              let address = this.data.address;
              const index = address.findIndex(item=>item._id===id)
              if(index > -1){
                address.splice(index,1)
                this.setData({
                  address
                })
                const storageAddress = wx.getStorageSync(ADDRESS_STORE_NAME);
                if(storageAddress && storageAddress._id ===id){
                  wx.removeStorageSync(ADDRESS_STORE_NAME)
                  if(this.data.address.length>0){
                    wx.setStorageSync(ADDRESS_STORE_NAME, this.data.address[0])
                    const Address = wx.getStorageSync(ADDRESS_STORE_NAME);
                    const AddressList = this.data.address;
                    const address=AddressList.map(item=>{
                      if(item._id===Address._id){
                        item.selected =true
                        wx.setStorageSync(ADDRESS_STORE_NAME, item)
                      }
                      return item
                    })
                    this.setData({
                      address
                    })
                  }
                }
              }
            }else{
              wx.showToast({
                title: res.message,
                icon:'none'
              })
            }
          }).finally(()=>{
            wx.hideLoading()
          })
        }
      }
    })
  },
  chooseAddress(e){
    if(navigateType !=='list'){
      return
    }
    const id = e.currentTarget.dataset.id;
    let addressList = this.data.address
    if(!id || addressList.length===0){
      return
    }
    let address = addressList.filter(item => item._id ===id);
    if(address.length>0){
      address[0].selected=true
      wx.setStorageSync(ADDRESS_STORE_NAME, address[0]);
      wx.switchTab({
        url: '/pages/list/list',
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