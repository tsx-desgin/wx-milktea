//app.js
import {getConfig} from './utils/function'
import {Login} from './modal/Login'
import {Token} from './storage/token'
const TokenStorage = new Token()
const AUTH_LOGIN_KEY = getConfig('app.auth_login_key')
App({
  // 生命周期函数,进入小程序时运行
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'milktea-ygxlo',
        traceUser: true,
      })
    }
    // 处理登录
    // wx.login({
    //   success: (res) => {
    //     console.log(res)
    //   },
    // })
    // 获取用户当前的授权状态。
    wx.getSetting({
      success: (res) => {
        // console.log(res)
        if(res.authSetting['scope.userInfo']){
          // 已经授权,登录
          // this.autoLogin()
          const token = TokenStorage.getStorage()
          if(token==''){
            wx.showToast({
              title: 'token为空,请重新登录~~~',
              icon:'none'
            })
            this.httpLogin()
          }
          if(token.expire_time===Date.now()){
            console.log(111)
            this.httpLogin()
          }
        }else{
          wx.setStorageSync(AUTH_LOGIN_KEY, 0)
        }
      },
    })

    this.globalData = {}
  },
  autoLogin(callback){
    wx.cloud.callFunction({
      name:'login'
    }).then(res =>{
      // console.log(res)
      if(res.result.success==1){
        wx.setStorageSync(AUTH_LOGIN_KEY, 1)
        wx.setStorageSync('openid', res.result.openid)
        // wx.showTabBar()
        callback&&callback()
      }else{
        wx.setStorageSync(AUTH_LOGIN_KEY, 0)
      }
    })
  },
  httpLogin(callback){
      wx.login({
        success: (res) => {
          if(res.code){
            Login.getToken(res.code).then(res =>{
              console.log(res)
              if(res.token){
                  wx.setStorageSync(AUTH_LOGIN_KEY, 1)
                  TokenStorage.setStorage(res.token,2)
                  wx.showTabBar()
                  callback&&callback()
              }
            })
          }
        },
      })
  }
})
