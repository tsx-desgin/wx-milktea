import {
  Storage
} from '../utils/Storage'
import {
  getConfig
} from '../utils/function'
const swiperKey = getConfig('storage.swiper') || 'swiper'
class Swiper extends Storage {
  constructor(){
    super(swiperKey, true)
  }
}

export {
  Swiper
}