import {
  isObject,
  isEmpty,
  getConfig
} from '../utils/function'
const ADDRESS_STORE_NAME = getConfig('storage.selectAddress')
class Address {
  static async add(address) {
    if(!isObject(address) || isEmpty(address)){
      return {success:0,message:'参数错误'}
    }
    const res = await wx.cloud.callFunction({
      name:'address',
      data:{
        $url:'add',
        address
      }
    }).then(res =>res.result)
    return res
  }
  static async getDefaultAddressOrSelect() {
    const storageAddress = wx.getStorageSync(ADDRESS_STORE_NAME);
    if(storageAddress){
      return storageAddress
    }
    try {
      return await wx.cloud.callFunction({
        name:'address',
        data:{
          $url:'default',
        }
      }).then(res =>res.result)
    } catch (error) {
      return {}
    }
  }
}

export {
  Address
}