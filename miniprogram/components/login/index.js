// components/login/index.js
import {getConfig} from '../../utils/function'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
   
  },
  // 生命周期
  lifetimes:{
    async attached(){
      const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
      const isLogin =await wx.getStorageSync(AUTH_LOGIN_KEY)
      let showLogin;
      if(isLogin==0){
        wx.hideTabBar()
        showLogin = true
      }else{
        wx.showTabBar()
        showLogin = false
      }
      this.setData({
        showLogin
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showLogin:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(e){
      console.log(e)
      if(e.detail.userInfo){
        // 允许授权
        // 获取app.js中的方法
        getApp().autoLogin(()=>{
          this.setData({
            showLogin:false
          })
        })
        // 登录
      }else{
        // 拒绝授权,关闭小程序
      }
    }
  }
})
