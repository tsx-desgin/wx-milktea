import {Http} from '../utils/Http'

class Swiper {
  static getSwiper(){
    return Http.request({
      url:'api/swiper?type=1',
    }).then(res => {
      return Promise.resolve(res)
    }).catch(err => {
      wx.showToast({
        title: err,
        icon:"none",
        mask:true
      })
    })
  }
}
export {
  Swiper
}
