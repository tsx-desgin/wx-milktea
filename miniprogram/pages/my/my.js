import {User} from '../../modal/User'
import {dateFormat,getRandom} from '../../utils/function'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}
  },
  async getUser(){
   const user = await User.getDetail()
   console.log(user)
   this.setData({
     userInfo:user
   })
  },
  chooseAvatar(){
    // 调起选图片
    wx.chooseImage({
      success:res =>{
        let avatarTempPaths = res.tempFilePaths[0]
        const apikey = 'f68bSYqte0m6EibwhARrzTcYDPoV0FobCi06uDfM3eF4QGQQKSywmd71ytM';
        const token = wx.getStorageSync('token').data
        wx.uploadFile({
          filePath: avatarTempPaths,
          name: 'image',
          url: 'http://api.4yue.top/index.php/api/user/avatar',
          header:{
            "Content-Type": "multipart/form-data",
            "appkey":apikey,
            token
          },
          success:result=>{
            if(wx.getStorageSync('token').expire_time<Date.now()){
              getApp().httpLogin()
            }
            const rest = JSON.parse(result.data)
            // console.log('http:'+res[res.length-1])
            console.log(JSON.parse(result.data))
            console.log(result)
             if(result.statusCode==200 && rest.error_code==0){
              this.setData({
                "userInfo.avatarUrl": rest.data.src
              })
             }  
          }
        })
      }
    })
    // wx.chooseImage({
    //   success: (res) => {
    //     console.log(res)
    //     let avatarTempPaths = res.tempFilePaths[0]
    //     const cloudPath='user-avatar/'+dateFormat('YYYY-MMM-dd',new Date())+'/'+Date.now()+getRandom()+avatarTempPaths.substr(avatarTempPaths.lastIndexOf('.'))
    //     // 上传图片到云存储
    //     wx.cloud.uploadFile({
    //       cloudPath,
    //       filePath:avatarTempPaths
    //     }).then(res =>{
    //       if(res.fileID){
    //         // 修改用户头像
    //         const avatarUrl = res.fileID
    //         wx.showLoading({
    //           title: '正在上传头像',
    //           mask:true
    //         })
    //         User.update(this.data.userInfo._id,{avatarUrl}).then(res=>{
    //           if(res.success == 1){
    //             this.setData({
    //               "userInfo.avatarUrl":avatarUrl
    //             })
                
    //           }else{
    //             wx.showToast({
    //               title: res.message,
    //               icon:'none',
    //               mask:true   
    //             })
    //           }
    //         }).finally(()=>wx.hideLoading())
    //       }
    //     })
    //   },
    // })
  },
  jump(e){
    // console.log(e.currentTarget.dataset.url)
    const url = e.currentTarget.dataset.url
    if(!url){
      return
    }
    wx.navigateTo({
      url,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUser()
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